import { remove } from "lodash";
import React, { type CSSProperties } from "react";
import { useDropzone } from "react-dropzone";
import type { Control, Path } from "react-hook-form";
import {
  useController,
  type FieldError,
  type UseFormRegisterReturn,
} from "react-hook-form";
import Switch from "react-switch";
import { cn } from "../../styles/utils";
import type { CustomFile } from "../../utils/validators/media";
import { Arrow } from "../Arrow";
import { Expandable } from "../Expandable";
import Loader from "../Loader";
import { MediaPreview } from "../MediaPreview";
import Modal from "../Modal";
import { SelectMenu } from "./SelectMenu";

//region Button
export const button = /*tw*/ `    
  flex 
  justify-center
  border
  border-transparent
  bg-indigo-600
  py-3
  px-4
  text-sm
  text-white
  shadow-sm
  hover:bg-indigo-700
  focus:outline-none
  focus:ring-2
  focus:ring-indigo-500
  focus:ring-offset-2
  cursor-pointer
  self-end
  w-40
  font-bold
  rounded-2xl
  m-1
`;

export const Button = ({
  children,
  ...buttonProps
}: React.PropsWithChildren<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
>) => (
  <button {...buttonProps} className={cn(button, buttonProps.className)}>
    {children}
  </button>
);

//endregion

//region Base
const baseField = /*tw*/ `
  bg-neutral-200
  dark:bg-neutral-800
  outline
  outline-neutral-300
  dark:outline-neutral-700
  h-16
  w-full
  flex-1
  font-medium
  placeholder:opacity-40
  rounded-xl
  p-5
  mb-2
  focus:outline-neutral-600
  dark:focus:outline-neutral-400
  placeholder-neutral-900
  dark:placeholder-neutral-500
`;

export type BaseFieldProps = {
  className?: string;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
  error?: FieldError;
  required?: boolean;
  register: UseFormRegisterReturn;
};

export type FieldWrapProps = React.PropsWithChildren<
  Pick<BaseFieldProps, "label" | "description" | "error" | "required">
>;

export const Description = ({
  description,
}: {
  description?: string;
}): JSX.Element => {
  if (!description) {
    return <React.Fragment />;
  }
  return (
    <div className="ml-3 mb-3 flex items-center">
      <div className="mr-1">💁‍♀️</div>
      <p className="text-xs">{description}</p>
    </div>
  );
};

export const ErrorMessage = ({
  error,
}: Pick<BaseFieldProps, "error">): JSX.Element => {
  if (!error?.message) {
    return <React.Fragment />;
  }
  return (
    <div className="ml-3 mb-3 text-red-700">
      <p className="text-xs">{error?.message}</p>
    </div>
  );
};

export const BaseField = ({
  label,
  description,
  error,
  required,
  children,
}: FieldWrapProps): JSX.Element => {
  return (
    <div className="mb-3 flex-1">
      {label && <p className="m-3 mb-5">{`${label} ${required ? "*" : ""}`}</p>}
      {children}
      <Description description={description} />
      <ErrorMessage error={error} />
    </div>
  );
};

//endregion

//region Text

export type TextProps = BaseFieldProps & {
  type?: React.HTMLInputTypeAttribute;
};

export const TextField = React.forwardRef(
  (
    inputProps: React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    ref: React.Ref<HTMLInputElement>
  ) => {
    return (
      <input
        ref={ref}
        {...inputProps}
        className={cn(baseField, inputProps.className)}
      />
    );
  }
);

export const Text = ({
  label,
  description,
  placeholder,
  disabled,
  error,
  type = "text",
  required,
  register,
}: TextProps): JSX.Element => {
  return (
    <BaseField
      required={required}
      label={label}
      description={description}
      error={error}
    >
      <TextField
        placeholder={placeholder}
        disabled={disabled}
        type={type}
        {...register}
      />
    </BaseField>
  );
};

//endregion

//region Area
export type AreaProps = BaseFieldProps & Pick<CSSProperties, "height">;

export const TextArea = React.forwardRef(
  (
    inputProps: React.DetailedHTMLProps<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      HTMLTextAreaElement
    >,
    ref: React.Ref<HTMLTextAreaElement>
  ) => {
    return (
      <textarea
        ref={ref}
        {...inputProps}
        className={cn(baseField, inputProps.className)}
      />
    );
  }
);

export const Area = ({
  className,
  label,
  placeholder,
  description,
  height,
  disabled,
  error,
  required,
  register,
}: AreaProps): JSX.Element => {
  return (
    <BaseField
      required={required}
      label={label}
      description={description}
      error={error}
    >
      <TextArea
        className={cn("h-24 max-h-24 focus:ring-0", className)}
        style={{ height }}
        placeholder={placeholder}
        disabled={disabled}
        {...register}
      />
    </BaseField>
  );
};

//endregion

//region Select
type SelectProps<S extends object> = Omit<BaseFieldProps, "register"> & {
  fieldName: Path<S>;
  options: string[];
  control: Control<S>;
  toggleable?: boolean;
};

export const SelectInput = ({
  children,
  ...selectProps
}: React.PropsWithChildren<
  React.DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  >
>) => {
  return (
    <select {...selectProps} className={cn(baseField, selectProps.className)}>
      {children}
    </select>
  );
};

export const Select = <S extends object>({
  fieldName,
  label,
  description,
  options,
  disabled,
  error,
  required,
  placeholder,
  control,
  toggleable,
}: SelectProps<S>): JSX.Element => {
  const { field } = useController({
    name: fieldName,
    control,
  });

  const handleOnChange = React.useCallback(
    (value: string) => {
      if (toggleable) {
        field.onChange(value !== field.value ? value : undefined);
      } else {
        field.onChange(value);
      }
    },
    [field, toggleable]
  );

  return (
    <BaseField
      required={required}
      label={label}
      description={description}
      error={error}
    >
      <SelectMenu
        selectedValue={field.value}
        menuItems={options}
        onSelect={handleOnChange}
      >
        {({ isOpen, setIsOpen }) => (
          <div
            className={cn(
              baseField,
              "relative flex cursor-pointer items-center",
              isOpen
                ? "outline outline-neutral-600 dark:outline-neutral-400"
                : ""
            )}
            onClick={disabled ? undefined : () => setIsOpen(true)}
          >
            <span className={cn("flex-1", field.value ? "" : "opacity-20")}>
              {field.value || placeholder}
            </span>

            <Arrow direction={isOpen ? "up" : "down"} />
          </div>
        )}
      </SelectMenu>
    </BaseField>
  );
};

export const Selector = <S extends object>({
  fieldName,
  label,
  description,
  options,
  disabled,
  error,
  required,
  placeholder,
  control,
  toggleable,
}: SelectProps<S>): JSX.Element => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const { field } = useController({
    name: fieldName,
    control,
  });

  const handleOnChange = React.useCallback(
    (value: string) => {
      if (toggleable) {
        field.onChange(value !== field.value ? value : undefined);
      } else {
        field.onChange(value);
      }
      setIsOpen(false);
    },
    [field, toggleable]
  );

  return (
    <BaseField
      required={required}
      label={label}
      description={description}
      error={error}
    >
      <div
        style={{ height: "unset" }}
        className={cn(
          baseField,
          "relative flex cursor-pointer flex-col items-center p-4 px-5",
          isOpen ? "outline outline-neutral-600 dark:outline-neutral-400" : ""
        )}
        onClick={disabled ? undefined : () => setIsOpen(!isOpen)}
      >
        <div className="flex w-full items-center">
          <span className={cn("flex-1", field.value ? "" : "opacity-20")}>
            {field.value || placeholder}
          </span>

          <Arrow direction={isOpen ? "up" : "down"} />
        </div>

        <div className="w-full">
          <Expandable expand={isOpen}>
            <div className="flex py-2">
              {options
                .filter((opt) => opt !== field.value)
                .map((opt, k) => {
                  return (
                    <div
                      key={k}
                      className="mr-3"
                      onClick={() => handleOnChange(opt)}
                    >
                      <p className="font-semibold opacity-40 transition-opacity duration-200 hover:opacity-100">
                        {opt}
                      </p>
                    </div>
                  );
                })}
            </div>
          </Expandable>
        </div>
      </div>
    </BaseField>
  );
};

//endregion

//region Toggle
export type ToggleProps = Omit<BaseFieldProps, "register"> & {
  onChange: (
    checked: boolean,
    event?:
      | MouseEvent
      | React.SyntheticEvent<MouseEvent | KeyboardEvent, Event>,
    id?: string
  ) => void;
  checked: boolean | null;
  register: () => void;
};

export const Toggle = ({
  label,
  description,
  checked: _checked,
  disabled,
  required,
  error,
  onChange,
  register,
}: ToggleProps): JSX.Element => {
  React.useEffect(() => {
    register();
  }, [register]);

  const [checked, setChecked] = React.useState<boolean>(!!_checked);

  React.useEffect(() => {
    setChecked(!!_checked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_checked]);

  React.useEffect(() => {
    onChange(checked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked]);

  return (
    <div className="mr-8 mb-3">
      <BaseField
        required={required}
        label={label}
        description={description}
        error={error}
      >
        <div className="ml-3">
          <Switch
            checkedIcon={false}
            uncheckedIcon={false}
            disabled={disabled}
            onChange={(c) => setChecked(c)}
            checked={checked}
          />
        </div>
      </BaseField>
    </div>
  );
};

//endregion

//region File
export const File = ({
  label,
  description,
  placeholder,
  disabled,
  required,
  error,
  register,
}: BaseFieldProps): JSX.Element => {
  return (
    <BaseField
      required={required}
      label={label}
      description={description}
      error={error}
    >
      <TextField
        id="title"
        type="file"
        placeholder={placeholder}
        disabled={disabled}
        {...register}
      />
    </BaseField>
  );
};

//endregion

//region Dropzone
export const RemoveButton = ({
  onPress,
}: {
  onPress: () => void;
}): JSX.Element => {
  return (
    <div className="absolute top-0 right-0 cursor-pointer" onClick={onPress}>
      ❌
    </div>
  );
};

export type DropzoneProps = Omit<BaseFieldProps, "register"> & {
  onChange: (files: CustomFile[]) => void;
  files?: CustomFile[];
  register: () => void;
};

export const Dropzone = ({
  files: _files,
  label,
  disabled,
  error,
  description,
  onChange,
  register,
}: DropzoneProps): JSX.Element => {
  const [files, setFiles] = React.useState<CustomFile[]>(_files || []);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => {
      const next = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      return [...prev, ...next];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    onDrop,
    disabled,
  });

  React.useEffect(() => {
    onChange(files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  React.useEffect(() => {
    if (!_files?.length) {
      setFiles([]);
    }
  }, [_files]);

  React.useEffect(() => {
    register();
  }, [register]);

  React.useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removePreview = React.useCallback((fileName: string) => {
    setFiles((_prev) => {
      const newSet = [..._prev];
      const removed = remove(newSet, (file) => file.name === fileName);
      URL.revokeObjectURL(removed[0].preview);
      return newSet;
    });
  }, []);

  const thumbs = files.map((file) => (
    <div className="relative" key={file.name}>
      <RemoveButton onPress={() => removePreview(file.name)} />

      <MediaPreview
        isLink={false}
        url={file.preview}
        contentType={file.type}
        className="m-3"
      />
    </div>
  ));

  return (
    <React.Fragment>
      <div
        className="my-6 flex h-28 cursor-pointer select-none items-center justify-center rounded-md border-4 border-dashed border-neutral-600"
        {...getRootProps({
          style: isDragActive ? { borderColor: "#4f46e5" } : undefined,
        })}
      >
        <input {...getInputProps()} />
        <p>{label}</p>
      </div>
      <Description description={description} />
      <ErrorMessage error={error} />
      <div className="flex flex-wrap">{thumbs}</div>
    </React.Fragment>
  );
};

//endregion

//region ModalSelect
export type ModalSelectProps = Omit<BaseFieldProps, "register"> & {
  value?: string;
  isFieldLoading?: boolean;
  children: (props: {
    setIsOpen: (status: boolean) => void;
  }) => React.ReactNode;
};

export const ModalSelect = ({
  value,
  label,
  description,
  placeholder,
  error,
  required,
  disabled,
  isFieldLoading,
  children,
}: ModalSelectProps): JSX.Element => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const handleSetIsOpen = React.useCallback(
    (status: boolean) => {
      if (!disabled) {
        setIsOpen(status);
      }
    },
    [disabled]
  );

  return (
    <BaseField
      required={required}
      label={label}
      description={description}
      error={error}
    >
      <div
        className={cn(baseField, "relative flex cursor-pointer items-center")}
        onClick={() => handleSetIsOpen(true)}
      >
        <span className={cn("flex-1", value ? "" : "opacity-20")}>
          {value || placeholder}
        </span>

        <div className="absolute right-4">
          <EndContent disabled={disabled} showLoader={isFieldLoading} />
        </div>
      </div>

      <Modal isOpen={isOpen && !disabled} onChange={handleSetIsOpen}>
        {children({ setIsOpen: handleSetIsOpen })}
      </Modal>
    </BaseField>
  );
};

const EndContent = ({
  showLoader,
  disabled,
}: {
  showLoader?: boolean;
  disabled?: boolean;
}): JSX.Element => {
  return (
    <div className="relative h-8 w-8">
      <Loader.Island isLoading={showLoader} size="sm" overlayOpacity={0} />

      <svg
        className={cn(
          disabled
            ? "fill-neutral-300 dark:fill-neutral-600"
            : "fill-neutral-400",
          "transition-opacity duration-700"
        )}
        style={{
          opacity: showLoader ? 0 : 1,
        }}
        viewBox="0 0 48 48"
        height="32"
        width="32"
      >
        <path d="M22.5 38V25.5H10v-3h12.5V10h3v12.5H38v3H25.5V38Z" />
      </svg>
    </div>
  );
};

//endregion
