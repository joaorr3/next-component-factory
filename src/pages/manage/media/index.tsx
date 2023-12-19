import Head from "next/head";
import Router from "next/router";
import React from "react";
import { BackButton } from "../../../components/BackButton";
import { InteractionElement } from "../../../components/InteractionElement";
import { ListMediaItem } from "../../../components/ListItem";
import { routes } from "../../../routes";
import { useLoading } from "../../../utils/GlobalState/GlobalStateProvider";
import { authLayer } from "../../../utils/server-side";
import { trpc } from "../../../utils/trpc";

const navigateUpload = () => {
  Router.push(routes.ManageMediaUpload.path);
};

export const getServerSideProps = authLayer("ManageMedia", async () => {
  return {
    props: {},
  };
});

export default function ManageMedia() {
  const {
    data: media,
    isLoading,
    fetchStatus,
    refetch,
  } = trpc.media.getAllGeneric.useQuery();

  const { mutateAsync: deleteMedia } = trpc.media.deleteMedia.useMutation();

  const { setLoading } = useLoading(isLoading && fetchStatus !== "idle");

  const handleDeleteMedia = React.useCallback(
    async (mediaId: string, s3Key: string) => {
      setLoading(true);
      await deleteMedia({ id: mediaId, type: "GENERIC", s3Key });
      await refetch();
      setLoading(false);
    },
    [deleteMedia, refetch, setLoading]
  );

  return (
    <React.Fragment>
      <Head>
        <title>Manage / Media</title>
      </Head>

      <main>
        <div className="mb-12">
          <BackButton />
        </div>

        {!media?.length && (
          <div className="mb-6 flex items-center">
            <p className="text-xl font-bold">0 results</p>
          </div>
        )}

        <div className="relative">
          <div className="absolute right-0 -top-16">
            <InteractionElement
              text="Upload"
              onPress={() => navigateUpload()}
            />
          </div>

          <div className="flex flex-col">
            {media?.map((m, index) => {
              if (m) {
                return (
                  <ListMediaItem
                    key={index}
                    mediaId={m.id}
                    s3Key={m.key}
                    mediaProps={{
                      contentType: m.fileType,
                      url: m.url,
                      metadata: m.meta || "",
                    }}
                    title={m.fileName}
                    footer={m.timestamp}
                    onDeleteRequest={handleDeleteMedia}
                  />
                );
              }

              return <React.Fragment key={index} />;
            })}
          </div>
        </div>
      </main>
    </React.Fragment>
  );
}
