"use client";

import { useState, useEffect } from "react";
import ShareButton from "./share-button";
import ShareDialog from "@/components/posts/share-dialog";

interface ShareDialogWrapperProps {
  postId: string;
  title: string;
  text: string;
}

export default function ShareDialogWrapper({ postId, title, text }: ShareDialogWrapperProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(`${window.location.origin}/post/${postId}`);
    }
  }, [postId]);

  return (
    <>
      <ShareButton
        postId={postId}
        title={title}
        text={text}
        onShareClick={() => setShowShareDialog(true)}
      />
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        url={url}
        title={title}
        text={text}
      />
    </>
  );
}
