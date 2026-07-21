import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createUser } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
});

const CreateUserForm = () => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: async (_user, variables) => {
      toast.success("Invite sent", {
        description: `An invitation has been sent to ${variables.email}.`,
      });
      form.reset();
      await queryClient.invalidateQueries({
        queryKey: queryKeys.organisationUsers,
      });
    },
    onError: (error) => {
      toast.error("Failed to create user", {
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add new user</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
          <DialogHeader>
            <DialogTitle>Add new user</DialogTitle>
            <DialogDescription>
              Invite a new user to your organisation by entering their name and
              email address. They will receive an email with instructions to
              join.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="my-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    {...field}
                    placeholder="John Doe"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    {...field}
                    placeholder="you@example.com"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button disabled={mutation.isPending} type="submit">
              Send invite
            </Button>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserForm;
