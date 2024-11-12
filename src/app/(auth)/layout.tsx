import React, { FC, PropsWithChildren } from "react";

const AuthLayout: FC<PropsWithChildren> = ({ children }) => {
  return <div>{children}</div>;
};

export default AuthLayout;
