import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@repo/ui/components/field";
import type React from "react";
import { useFieldContext } from "../form-context";

type InputFieldProps = {
  label: React.ReactNode;
  description?: React.ReactNode;
} & React.ComponentProps<typeof FieldControl>;

export function InputField(props: InputFieldProps) {
  const field = useFieldContext<string | number>();

  return (
    <Field>
      <FieldLabel>{props.label}</FieldLabel>
      {props.description && (
        <FieldDescription>{props.description}</FieldDescription>
      )}
      <FieldControl
        {...props}
        onChange={(e) => field.handleChange(e.target.value)}
        value={field.state.value}
      />
      <FieldError
        match={field.state.meta.isTouched && !field.state.meta.isValid}
      >
        {field.state.meta.errors.map((e) => e.message).join(", ")}
      </FieldError>
    </Field>
  );
}
