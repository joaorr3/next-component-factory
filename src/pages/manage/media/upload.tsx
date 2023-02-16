import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import Router from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BackButton } from "../../../components/BackButton";
import * as Fields from "../../../components/Form/Fields";
import { useFileUpload } from "../../../hooks/useFileUpload";
import { routes } from "../../../routes";
import { useLoading } from "../../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../../utils/hoc";
import type { CustomFile } from "../../../utils/validators/media";
import { rawFileValidator } from "../../../utils/validators/media";

const mediaFormSchemaValidator = z.object({
  files: rawFileValidator,
});

export type MediaFormSchema = z.infer<typeof mediaFormSchemaValidator>;

const redirect = () => {
  Router.push(routes.ManageMedia.path);
};

export default withRoles("ManageMediaUpload", () => {
  const { upload } = useFileUpload("GENERIC");

  const { setLoading } = useLoading();

  const handleFilesUpload = React.useCallback(
    async (files: CustomFile[], id?: string) => {
      return Promise.all(
        files.map((file) => upload(file, { identifier: id }))
      ).then((images) => {
        return images;
      });
    },
    [upload]
  );

  const {
    formState,
    register,
    getValues,
    setValue,
    getFieldState,
    handleSubmit,
  } = useForm<MediaFormSchema>({
    resolver: zodResolver(mediaFormSchemaValidator),
  });

  const handleOnSubmit = React.useCallback(
    async ({ files }: MediaFormSchema) => {
      setLoading(true);
      await handleFilesUpload(files);
      setLoading(false);
      redirect();
    },
    [handleFilesUpload, setLoading]
  );

  return (
    <React.Fragment>
      <Head>
        <title>Manage / Media / Upload</title>
      </Head>

      <main>
        <div className="mb-12">
          <BackButton />
        </div>

        <div className="mb-4 flex flex-col rounded-xl bg-neutral-200 p-4 dark:bg-neutral-800">
          <form onSubmit={handleSubmit(handleOnSubmit)}>
            <Fields.Dropzone
              files={getValues("files")}
              label="Drop it like it's hot"
              disabled={formState.isSubmitting}
              register={() => register("files")}
              error={getFieldState("files").error}
              onChange={(files) => setValue("files", files)}
            />
            <div className="flex justify-end">
              <Fields.Button type="submit" disabled={formState.isSubmitting}>
                Upload
              </Fields.Button>
            </div>
          </form>
        </div>
      </main>
    </React.Fragment>
  );
});
