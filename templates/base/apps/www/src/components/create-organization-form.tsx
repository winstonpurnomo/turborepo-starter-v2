import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import z from "zod";
import { createOrganization } from "@/server/functions/workos";
import { useAppForm } from "./form-context";

const schema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
});

type Schema = z.infer<typeof schema>;

export function CreateOrganizationForm({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: () => void;
}) {
  const createOrgHandler = useServerFn(createOrganization);
  const createOrgMutation = useMutation({
    mutationFn: async (data: Schema) =>
      createOrgHandler({
        data: {
          name: data.name,
          slug: data.slug,
        },
      }),
    onSuccess,
    onError,
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      slug: "",
    },
    validators: {
      onChange: z.object({
        name: z.string().min(3),
        slug: z.string().min(3),
      }),
    },
    onSubmit: async ({ value }) => {
      await createOrgMutation.mutateAsync(value);
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="name">
        {(field) => <field.InputField label="Name" placeholder="Name" />}
      </form.AppField>

      <form.AppField name="slug">
        {(field) => <field.InputField label="Slug" placeholder="Slug" />}
      </form.AppField>

      <form.AppForm>
        <form.SubmitButton label="Create Organization" />
      </form.AppForm>
    </form>
  );
}
