"use client";

import { useForm, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React, { useEffect, useState } from "react";
import { HiArrowRight } from "react-icons/hi2";
import sanitizeHtml from "sanitize-html";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldValuesInput, GetGravityFormByIdQuery, InputMaybe } from "@/lib/headkit/generated";
import { snakeCase } from "@/lib/utils";
import { getGravityFormById, submitGravityForm } from "@/lib/headkit/actions";

interface GravityFormProps {
  id?: string;
  formId: string;
  initialValues?: { fieldName: string; value: string }[];
  onSubmit?: (values: { [key: string]: string }) => Promise<void>;
  extraFields?: React.ReactNode;
  buttonClassName?: string;
  disabled?: boolean;
}

type FieldType = "text" | "name" | "email" | "textarea" | "select" | "radio" | "checkbox";

interface FormField {
  type: FieldType;
  label: string;
  isRequired: boolean;
  placeholder?: string;
  defaultValue?: string;
  choices?: { text: string; value: string }[];
  databaseId: number;
}

interface DataLayer {
  push(event: { event: string; ecommerce: { item_list_name: string } }): void;
}

declare global {
  interface Window {
    dataLayer?: DataLayer;
  }
}

// Helper function to generate Zod schema based on form fields
const generateValidationSchema = (fields: FormField[]) => {
  const schemaFields: Record<string, z.ZodString> = {};

  fields?.forEach((field) => {
    const fieldName = snakeCase(field.label);
    let schema = z.string();

    if (field.isRequired) {
      schema = schema.min(1, `${field.label} is required`);
    }

    if (field.type === "email") {
      schema = schema.email("Invalid email address");
    }

    schemaFields[fieldName] = schema;
  });

  return z.object(schemaFields);
};

interface RenderFieldProps {
  field: FormField;
  control: Control<z.infer<ReturnType<typeof generateValidationSchema>>>;
}

const RenderField = ({ field, control }: RenderFieldProps) => {
  const fieldName = snakeCase(field.label);

  switch (field.type) {
    case "text":
    case "name":
    case "email":
      return (
        <FormField
          control={control}
          name={fieldName}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Input
                  type={field.type === "email" ? "email" : "text"}
                  placeholder={field.placeholder}
                  {...formField}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "textarea":
      return (
        <FormField
          control={control}
          name={fieldName}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={field.placeholder}
                  className="min-h-[120px]"
                  {...formField}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "select":
      return (
        <FormField
          control={control}
          name={fieldName}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {field.choices?.map((choice) => (
                    <SelectItem key={choice.value} value={choice.value}>
                      {choice.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "radio":
      return (
        <FormField
          control={control}
          name={fieldName}
          render={({ field: formField }) => (
            <FormItem className="space-y-3">
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                  className="space-y-1"
                >
                  {field.choices?.map((choice) => (
                    <FormItem
                      key={choice.value}
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem value={choice.value} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {choice.text}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "checkbox":
      return (
        <FormField
          control={control}
          name={fieldName}
          render={({ field: formField }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={formField.value === "true"}
                  onCheckedChange={(checked) => {
                    formField.onChange(checked ? "true" : "false");
                  }}
                />
              </FormControl>
              <FormLabel className="font-normal">
                {field.label}
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    default:
      return null;
  }
};

const SuccessBox = ({ message }: { message: string }) => {
  return (
    <div className="rounded-2xl border-2 border-green-2 p-8">
      <div className="text-center font-medium">
        {message}
      </div>
    </div>
  );
};

const GravityFormSkeleton = () => (
  <div className="flex w-full flex-col gap-2">
    <Skeleton className="h-10" />
    <Skeleton className="h-10" />
    <Skeleton className="h-10" />
    <Skeleton className="h-10" />
    <Skeleton className="h-24" />
    <Skeleton className="h-10" />
  </div>
);

interface GfFormField {
  type: string;
  label: string;
  isRequired: boolean;
  placeholder?: string;
  defaultValue?: string;
  choices?: {
    nodes?: Array<{
      text?: string;
      value?: string;
    }>;
  };
  databaseId: number;
}

export const GravityForm = ({
  id,
  formId,
  initialValues,
  onSubmit,
  extraFields,
  buttonClassName,
  disabled = false,
}: GravityFormProps) => {
  const [message, setMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<GetGravityFormByIdQuery | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      setIsLoading(true);
      try {
        const response = await getGravityFormById({
          id: formId,
        });
        setFormData(response.data);
      } catch (error) {
        setFormData(null);
        console.error('Failed to fetch form:', error);
      }
      setIsLoading(false);
    };
    fetchForm();
  }, [formId]);

  const formFields = formData?.gfForm?.formFields?.nodes
    .map(node => {
      const field = node as unknown as GfFormField;
      if (!field?.type || !field?.label) return null;

      const type = field.type.toLowerCase();
      if (!["text", "name", "email", "textarea", "select", "radio", "checkbox"].includes(type)) {
        return null;
      }

      return {
        type: type as FieldType,
        label: field.label,
        isRequired: Boolean(field.isRequired),
        placeholder: field.placeholder || undefined,
        defaultValue: field.defaultValue || "",
        choices: field.choices?.nodes?.map(choice => ({
          text: choice?.text || "",
          value: choice?.value || "",
        })),
        databaseId: field.databaseId,
      } satisfies FormField;
    })
    .filter((field): field is NonNullable<typeof field> =>
      field !== null &&
      !initialValues?.map(v => v.fieldName)?.includes(snakeCase(field.label))
    );

  const validationSchema = generateValidationSchema(formFields || []);

  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: formFields?.reduce<Record<string, string>>(
      (acc, field) => ({
        ...acc,
        [snakeCase(field.label)]: field.defaultValue || "",
      }),
      {}
    ),
  });

  if ((!isLoading && !formData)) {
    return (
      <div className="p-4 text-center  ">
        Form not found for this formId
      </div>
    );
  }

  if (isLoading) return <GravityFormSkeleton />;

  if (successMessage) {
    return <SuccessBox message={successMessage} />;
  }

  const handleSubmit = async (values: z.infer<typeof validationSchema>) => {
    try {
      setIsSubmitting(true);
      setMessage(null);

      // Combine with initial values if any
      const formattedInitialValues = initialValues
        ?.map((item) => ({ [item.fieldName]: item.value }))
        ?.reduce<Record<string, string>>((acc, curr) => ({ ...acc, ...curr }), {});
      const allValues = { ...values, ...formattedInitialValues };

      // Submit to Gravity Forms
      const response = await submitGravityForm({
        input: {
          id: formId,
          saveAsDraft: false,
          fieldValues: Object.entries(allValues).map(([key, value]) => ({
            id: formFields?.find((f) => snakeCase(f.label) === key)?.databaseId,
            value: value?.toString() || "",
          })) as InputMaybe<FormFieldValuesInput>[],
        },
      });

      const result = response.data;

      // Call custom onSubmit if provided
      if (onSubmit) {
        await onSubmit(values);
      }

      // Show success message
      setSuccessMessage(
        sanitizeHtml(result?.submitGfForm?.confirmation?.message || "Form submitted successfully", {
          allowedTags: [],
        })
      );

      // Track form submission
      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push({
          event: "enquire_form",
          ecommerce: {
            item_list_name: values?.product_name || "",
          },
        });
      }

      form.reset();
    } catch (error) {
      const apiError = error as { response?: { errors?: { message: string }[] } };
      if (apiError.response?.errors?.length) {
        setMessage(apiError.response.errors[0].message);
      } else {
        setMessage("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        id={id || "gravityForm"}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-[20px]"
      >
        {formFields?.map((field) => (
          <RenderField
            key={field.databaseId}
            field={field}
            control={form.control}
          />
        ))}

        {extraFields}

        <Button
          type="submit"
          disabled={disabled || isSubmitting}
          className={buttonClassName}
          fullWidth
        >
          {formData?.gfForm?.submitButton?.text || "Submit Form"}
          <HiArrowRight className="ml-[20px]" />
        </Button>

        {message && (
          <div className="mt-0.5 flex flex-wrap ">{message}</div>
        )}
      </form>
    </Form>
  );
}; 