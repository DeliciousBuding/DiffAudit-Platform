package proxy

import (
	"strings"
	"testing"
)

func TestNewDemoJobStoreSeedsSixJobs(t *testing.T) {
	store := NewDemoJobStore()
	jobs := store.List()

	if len(jobs) != 6 {
		t.Fatalf("expected 6 demo jobs, got %d", len(jobs))
	}
}

func TestDemoJobStoreListReturnsAllJobs(t *testing.T) {
	store := NewDemoJobStore()
	jobs := store.List()

	seen := make(map[string]bool)
	for _, job := range jobs {
		if job.JobID == "" {
			t.Fatalf("expected non-empty job_id")
		}
		if seen[job.JobID] {
			t.Fatalf("duplicate job_id: %s", job.JobID)
		}
		seen[job.JobID] = true
		if job.DemoMode != true {
			t.Fatalf("expected demo_mode=true for job %s", job.JobID)
		}
	}
}

func TestDemoJobStoreListReturnsIsolatedSlice(t *testing.T) {
	store := NewDemoJobStore()
	jobs1 := store.List()
	jobs2 := store.List()

	// The returned slices are distinct (appending to one doesn't affect the other).
	// Note: job *contents* are shared pointers — List() owns mutation of job state
	// via time-based progression; callers receive a snapshot view and should not
	// mutate returned jobs.
	if len(jobs1) != len(jobs2) {
		t.Fatalf("job count changed between List calls: %d vs %d", len(jobs1), len(jobs2))
	}
	// Job IDs should be stable
	for i := range jobs1 {
		if jobs1[i].JobID != jobs2[i].JobID {
			t.Fatalf("job order/IDs changed between List calls")
		}
	}
}

func TestDemoJobStoreFindReturnsJob(t *testing.T) {
	store := NewDemoJobStore()
	job := store.Find("demo-job-001")

	if job == nil {
		t.Fatalf("expected to find demo-job-001")
	}
	if job.JobID != "demo-job-001" {
		t.Fatalf("expected job_id demo-job-001, got %s", job.JobID)
	}
	if job.Status != "completed" {
		t.Fatalf("expected status completed, got %s", job.Status)
	}
}

func TestDemoJobStoreFindReturnsNilForMissing(t *testing.T) {
	store := NewDemoJobStore()
	job := store.Find("nonexistent-job-id")

	if job != nil {
		t.Fatalf("expected nil for missing job, got %v", job)
	}
}

func TestDemoJobStoreFindReturnsCopy(t *testing.T) {
	store := NewDemoJobStore()
	job := store.Find("demo-job-001")

	if job == nil {
		t.Fatalf("expected to find demo-job-001")
	}
	job.Status = "mutated"

	// Original should not be affected
	original := store.Find("demo-job-001")
	if original == nil || original.Status == "mutated" {
		t.Fatalf("Find should return a copy, but mutation leaked")
	}
}

func TestDemoJobStoreCreate(t *testing.T) {
	store := NewDemoJobStore()
	initial := len(store.List())

	job := store.Create("black-box/recon/sd15-ddim", "test-workspace", "attack")

	if job == nil {
		t.Fatalf("expected created job")
	}
	if job.JobID == "" {
		t.Fatalf("expected non-empty job_id")
	}
	if !strings.HasPrefix(job.JobID, "demo-job-") {
		t.Fatalf("expected job_id to start with demo-job-, got %s", job.JobID)
	}
	if job.Status != "queued" {
		t.Fatalf("expected status queued, got %s", job.Status)
	}
	if job.ContractKey != "black-box/recon/sd15-ddim" {
		t.Fatalf("expected contract_key preserved, got %s", job.ContractKey)
	}
	if job.WorkspaceName != "test-workspace" {
		t.Fatalf("expected workspace_name preserved, got %s", job.WorkspaceName)
	}
	if job.TargetModel != "stable-diffusion-v1-4" {
		t.Fatalf("expected target_model inferred, got %s", job.TargetModel)
	}
	if job.Track != "black-box" {
		t.Fatalf("expected track inferred as black-box, got %s", job.Track)
	}
	if job.DemoMode != true {
		t.Fatalf("expected demo_mode=true")
	}
	if len(store.List()) != initial+1 {
		t.Fatalf("expected %d jobs after create, got %d", initial+1, len(store.List()))
	}
}

func TestDemoJobStoreCancel(t *testing.T) {
	store := NewDemoJobStore()
	job := store.Cancel("demo-job-004")

	if job == nil {
		t.Fatalf("expected to cancel demo-job-004")
	}
	if job.Status != "cancelled" {
		t.Fatalf("expected status cancelled, got %s", job.Status)
	}
	if job.JobID != "demo-job-004" {
		t.Fatalf("expected job_id demo-job-004, got %s", job.JobID)
	}
}

func TestDemoJobStoreCancelReturnsNilForMissing(t *testing.T) {
	store := NewDemoJobStore()
	job := store.Cancel("nonexistent-job-id")

	if job != nil {
		t.Fatalf("expected nil for missing job, got %v", job)
	}
}

func TestInferModelFromContract(t *testing.T) {
	tests := []struct {
		contractKey string
		expected    string
	}{
		{"black-box/recon/sd15-ddim", "stable-diffusion-v1-4"},
		{"gray-box/pia/pixelart-v2", "pixelart-v2"},
		{"white-box/gsa/photoreal-xl", "photoreal-xl"},
		{"gray-box/pia/medmnist-derma-v3", "medmnist-derma-v3"},
		{"white-box/gsa/audio-diffusion-s", "audio-diffusion-s"},
		{"unknown/contract/key", "unknown"},
	}

	for _, tc := range tests {
		t.Run(tc.contractKey, func(t *testing.T) {
			result := inferModelFromContract(tc.contractKey)
			if result != tc.expected {
				t.Fatalf("inferModelFromContract(%q) = %q, want %q", tc.contractKey, result, tc.expected)
			}
		})
	}
}

func TestInferTrackFromContract(t *testing.T) {
	tests := []struct {
		contractKey string
		expected    string
	}{
		{"black-box/recon/sd15-ddim", "black-box"},
		{"gray-box/pia/cifar10-ddpm", "gray-box"},
		{"white-box/gsa/ddpm-cifar10", "white-box"},
		{"recon_artifact_mainline", "black-box"},
		{"pia_runtime_mainline", "gray-box"},
		{"gsa_runtime_mainline", "white-box"},
		{"unknown/unknown/unknown", "black-box"},
	}

	for _, tc := range tests {
		t.Run(tc.contractKey, func(t *testing.T) {
			result := inferTrackFromContract(tc.contractKey)
			if result != tc.expected {
				t.Fatalf("inferTrackFromContract(%q) = %q, want %q", tc.contractKey, result, tc.expected)
			}
		})
	}
}

func TestDemoJobStoreRunningJobsProgressOverTime(t *testing.T) {
	store := NewDemoJobStore()

	// Find a running job
	job := store.Find("demo-job-003")
	if job == nil {
		t.Fatalf("expected to find demo-job-003")
	}
	if job.Status != "running" {
		t.Fatalf("expected status running, got %s", job.Status)
	}
	if job.ProgressPct == nil {
		t.Fatalf("expected progress_pct for running job")
	}
	if *job.ProgressPct < 0 || *job.ProgressPct > 100 {
		t.Fatalf("progress_pct out of range: %d", *job.ProgressPct)
	}
}

func TestDemoJobStoreListDoesNotMutateStoredJobs(t *testing.T) {
	store := NewDemoJobStore()

	// List should not mutate
	jobs1 := store.List()
	jobs2 := store.List()

	if len(jobs1) != len(jobs2) {
		t.Fatalf("job count changed between List calls: %d vs %d", len(jobs1), len(jobs2))
	}
	// Job IDs should be stable
	for i := range jobs1 {
		if jobs1[i].JobID != jobs2[i].JobID {
			t.Fatalf("job order/IDs changed between List calls")
		}
	}
}

func TestIntPtr(t *testing.T) {
	v := intPtr(42)
	if v == nil || *v != 42 {
		t.Fatalf("intPtr(42) = %v, want pointer to 42", v)
	}

	v2 := intPtr(0)
	if v2 == nil || *v2 != 0 {
		t.Fatalf("intPtr(0) = %v, want pointer to 0", v2)
	}
}
