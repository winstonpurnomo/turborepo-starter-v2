import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { InputField } from "./forms/input-field";
import { SubmitButton } from "./forms/submit-button";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    InputField,
  },
  formComponents: {
    SubmitButton,
  },
});
