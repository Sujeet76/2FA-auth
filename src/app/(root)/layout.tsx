import React, { FC, PropsWithChildren } from "react";

const LayoutPage: FC<PropsWithChildren> = ({ children }) => {
  return <div>{children}</div>;
};

export default LayoutPage;
