import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import type React from "react";
import { useFieldContext } from "../form-context";

type InputFieldProps = {
	label: React.ReactNode;
	description?: React.ReactNode;
} & React.ComponentProps<typeof Input>;

export function InputField(props: InputFieldProps) {
	const field = useFieldContext<string | number>();

	return (
		<Field>
			<FieldLabel>{props.label}</FieldLabel>
			{props.description && (
				<FieldDescription>{props.description}</FieldDescription>
			)}
			<Input
				{...props}
				onChange={(e) => field.handleChange(e.target.value)}
				value={field.state.value}
			/>
			<FieldError errors={field.state.meta.errors} />
		</Field>
	);
}
