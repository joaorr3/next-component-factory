import { remove } from "lodash";
import Image from "next/image";
import React, { type CSSProperties } from "react";
import { useDropzone } from "react-dropzone";
import { type FieldError, type UseFormRegisterReturn } from "react-hook-form";
import Switch from "react-switch";
import tw from "tailwind-styled-components";
import { type FormSchema } from "./models";
import { type CustomFile } from "./validator";

//region Button
export const Button = tw.button`    
  flex 
  justify-center
  rounded-md
  border
  border-transparent
  bg-indigo-600
  py-2
  px-4
  text-sm
  font-medium
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
`;

//endregion

//region Base
const baseField = () => /*tw*/ `
  bg-opacity-20
  bg-neutral-700
  h-16
  w-full
  font-medium
  placeholder:opacity-40
  rounded-xl
  p-5
  focus:outline-none
  mb-2
  border-none
`;

export type BaseFieldProps = {
  label: string;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
  error?: FieldError;
  register: UseFormRegisterReturn<keyof FormSchema>;
};

export type FieldWrapProps = React.PropsWithChildren<
  Pick<BaseFieldProps, "label" | "description" | "error">
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
  children,
}: FieldWrapProps): JSX.Element => {
  return (
    <div className="mb-3">
      <p className="m-3 mb-5">{label}</p>
      {children}
      <Description description={description} />
      <ErrorMessage error={error} />
    </div>
  );
};

//endregion

//region Text

export type TextProps = BaseFieldProps;

export const TwTextField = tw.input`
  ${baseField}
`;

export const Text = ({
  label,
  description,
  placeholder,
  disabled,
  error,
  register,
}: TextProps): JSX.Element => {
  return (
    <BaseField label={label} description={description} error={error}>
      <TwTextField
        id="title"
        placeholder={placeholder}
        disabled={disabled}
        {...register}
      />
    </BaseField>
  );
};

//endregion

//region Area
export type AreaProps = BaseFieldProps & Pick<CSSProperties, "height">;

const TwTextArea = tw.textarea`
  ${baseField}
  focus:ring-0
  h-24
`;

export const Area = ({
  label,
  placeholder,
  description,
  height,
  disabled,
  error,
  register,
}: AreaProps): JSX.Element => {
  return (
    <BaseField label={label} description={description} error={error}>
      <TwTextArea
        id="title"
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
type SelectProps = Omit<BaseFieldProps, "placeholder"> & {
  options: string[];
};

export const TwSelect = tw.select`
  ${baseField}
`;

export const Select = ({
  label,
  description,
  options,
  disabled,
  error,
  register,
}: SelectProps): JSX.Element => {
  const ref = React.useRef<HTMLSelectElement>(null);

  ref.current?.selectedIndex;
  return (
    <BaseField label={label} description={description} error={error}>
      {/* @ts-ignore */}
      <TwSelect ref={ref} disabled={disabled} {...register}>
        <option value="" selected disabled hidden>
          -- select an option --
        </option>

        {options.map((value, key) => {
          return (
            <option key={key} value={value}>
              {value}
            </option>
          );
        })}
      </TwSelect>
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
      <BaseField label={label} description={description} error={error}>
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
const TwFileField = tw.input`
  ${baseField}
`;

export const File = ({
  label,
  description,
  placeholder,
  disabled,
  error,
  register,
}: BaseFieldProps): JSX.Element => {
  return (
    <BaseField label={label} description={description} error={error}>
      <TwFileField
        {...register}
        id="title"
        type="file"
        name="file"
        placeholder={placeholder}
        disabled={disabled}
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

      <div className="">
        <Image
          alt=""
          src={file.preview}
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
          className="m-3"
          width={400}
          height={200}
          style={{
            objectFit: "cover",
            maxWidth: 100,
            width: "100%",
            height: 100,
          }}
        />
      </div>
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
      <ErrorMessage error={error} />
      <div className="flex">{thumbs}</div>
    </React.Fragment>
  );
};

//endregion
