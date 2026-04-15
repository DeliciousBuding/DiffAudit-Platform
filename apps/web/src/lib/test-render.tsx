/**
 * Test helper: renders a React element to a string, resolving Suspense boundaries.
 * Uses renderToPipeableStream so async components inside <Suspense> resolve properly.
 *
 * React's streaming SSR outputs fallback content, a hidden div with resolved content,
 * and an inline script ($RC) that swaps them.  We simulate that swap here by
 * replacing the fallback marker with the resolved hidden content.
 */
import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";

export async function renderWithSuspense(element: React.ReactElement): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];

    const { pipe } = renderToPipeableStream(element, {
      onAllReady() {
        const passThrough = new PassThrough();
        passThrough.on("data", (chunk: Buffer) => chunks.push(chunk));
        passThrough.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        passThrough.on("error", reject);
        pipe(passThrough);
      },
      onError(error) {
        reject(error);
      },
    });
  });

  // React streaming output contains:
  //   <!--$?--><template id="B:0"></template>FALLBACK<!--/$-->
  //   <div hidden id="S:0">RESOLVED</div><script>$RC("B:0","S:0")</script>
  // We simulate the $RC swap: replace the Suspense boundary with resolved content.

  // 1. Extract resolved content from <div hidden id="S:..."> blocks
  const hiddenDivs = new Map<string, string>();
  const hiddenRegex = /<div hidden id="(S:\d+)">([\s\S]*?)<\/div>/g;
  let match: RegExpExecArray | null;
  while ((match = hiddenRegex.exec(raw)) !== null) {
    hiddenDivs.set(match[1], match[2]);
  }

  // 2. Process $RC calls in order: $RC("B:X", "S:Y") means replace B:X boundary with S:Y content
  const swaps: Array<{ boundaryId: string; resolvedId: string }> = [];
  const rcRegex = /\$RC\("(B:\d+)","(S:\d+)"\)/g;
  while ((match = rcRegex.exec(raw)) !== null) {
    swaps.push({ boundaryId: match[1], resolvedId: match[2] });
  }

  let result = raw;

  for (const swap of swaps) {
    const resolved = hiddenDivs.get(swap.resolvedId) ?? "";
    // Remove the boundary marker: <!--$?--><template id="B:X"></template>...<!--/$-->
    const boundaryPattern = new RegExp(
      `<!--\\$\\?--><template id="${swap.boundaryId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"></template>[\\s\\S]*?<!--/\\$-->`,
      "g",
    );
    result = result.replace(boundaryPattern, resolved);
  }

  // 3. Clean up: remove remaining streaming infrastructure
  result = result.replace(/<template id="B:\d+"><\/template>/g, "");
  result = result.replace(/<div hidden id="S:\d+">[\s\S]*?<\/div>/g, "");
  result = result.replace(/<script>[\s\S]*?<\/script>/g, "");
  result = result.replace(/<!--\$\?-->/g, "");
  result = result.replace(/<!--\/\$-->/g, "");

  return result;
}
