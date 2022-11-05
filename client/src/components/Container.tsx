import React from "react";

type Props = {
  children: React.ReactNode;
};

export const Container = (props: Props) => {
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-center">{props.children}</div>
    </div>
  );
};
