"use client";

import * as React from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * Form — react-hook-form integration on top of the field primitives.
 *
 * Collapses the three legacy forms (login-form / register-form / trial-form),
 * which each hand-rolled validation, error display, and label/input pairing
 * with different class vocabularies. One pattern: `Form` (a RHF `FormProvider`)
 * > `FormField` (a `Controller`) > `FormItem` > (`FormLabel`, `FormControl`,
 * `FormDescription`, `FormMessage`). The `useFormField` hook wires the
 * generated id, `aria-describedby`, and `aria-invalid` between control, label,
 * description, and message — the a11y contract the legacy forms lacked.
 */
const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("group/form-item flex w-full flex-col gap-1.5", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) throw new Error("useFormField must be used within a <FormField>");

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField();
  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<"div">) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        error ? `${formDescriptionId} ${formMessageId}` : `${formDescriptionId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();
  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-[11px] leading-4 text-muted-foreground", className)}
      {...props}
    />
  );
}

function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;
  if (!body) return null;
  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-[11px] leading-4 font-normal text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
}

/**
 * Minimal Slot — merges className/props onto its single child so
 * `FormControl` can inject id + aria onto an Input/Select/Checkbox without a
 * wrapper element. (Base UI exposes no Slot subpath, so this is the tiny,
 * dependency-free equivalent.)
 */
type SlotProps = React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode };

function Slot({ children, ...props }: SlotProps) {
  if (!React.isValidElement(children)) return null;
  const child = children as React.ReactElement<Record<string, unknown>>;
  const childClassName = child.props.className as string | undefined;
  return React.cloneElement(child, {
    ...props,
    className: childClassName ? cn(childClassName, props.className) : props.className,
  });
}

export {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
};
