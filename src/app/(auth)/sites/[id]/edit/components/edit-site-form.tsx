"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Site } from "@/lib/types";

import { updateSite } from "../actions";

const optionalNumber = z
  .union([z.literal(""), z.coerce.number()])
  .transform((value) => (value === "" ? null : value))
  .nullable();

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  addressLine1: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postcode: z.string().min(1, "Postcode is required"),
  sector: z.string().optional(),
  area: optionalNumber,
  eac: optionalNumber,
});

type FormValues = z.input<typeof formSchema>;
type ParsedValues = z.output<typeof formSchema>;

const EditSiteForm = ({ site }: { site: Site }) => {
  const router = useRouter();
  const form = useForm<FormValues, unknown, ParsedValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: site.name,
      addressLine1: site.addressLine1,
      city: site.city,
      postcode: site.postcode,
      sector: site.sector ?? "",
      area: site.area ?? "",
      eac: site.eac ?? "",
    },
  });

  async function onSubmit(data: ParsedValues) {
    try {
      await updateSite(site.id, {
        name: data.name,
        addressLine1: data.addressLine1,
        city: data.city,
        postcode: data.postcode,
        sector: data.sector || null,
        area: data.area,
        eac: data.eac,
      });
    } catch (error) {
      // Next.js redirects throw a special error we should rethrow so the redirect works
      if (
        error instanceof Error &&
        "digest" in error &&
        typeof (error as { digest?: string }).digest === "string" &&
        (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
      ) {
        throw error;
      }

      toast.error("Failed to update site", {
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
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
                placeholder="Head office"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="addressLine1"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="addressLine1">Address</FieldLabel>
              <Input
                id="addressLine1"
                type="text"
                {...field}
                placeholder="123 Example Street"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <div className="grid gap-7 md:grid-cols-2">
          <Controller
            name="city"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input id="city" type="text" {...field} placeholder="London" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="postcode"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="postcode">Postcode</FieldLabel>
                <Input
                  id="postcode"
                  type="text"
                  {...field}
                  placeholder="SW1A 1AA"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
        <Controller
          name="sector"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sector">Sector</FieldLabel>
              <Input
                id="sector"
                type="text"
                {...field}
                placeholder="e.g. Retail, Office, Industrial"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <div className="grid gap-7 md:grid-cols-2">
          <Controller
            name="area"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="area">Floor area (m²)</FieldLabel>
                <Input
                  id="area"
                  type="number"
                  step="any"
                  value={(field.value as number | "" | null) ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  placeholder="500"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="eac"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="eac">
                  Estimated annual consumption (kWh)
                </FieldLabel>
                <Input
                  id="eac"
                  type="number"
                  step="any"
                  value={(field.value as number | "" | null) ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  placeholder="25000"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/sites/${site.id}`)}
          >
            Cancel
          </Button>
          <Button disabled={form.formState.isSubmitting} type="submit">
            Save changes
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
};

export default EditSiteForm;
