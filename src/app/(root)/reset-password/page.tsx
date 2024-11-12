import ResetPasswordForm from "@/components/reset-password-form";
import { getServerSession } from "@/server-action/auth.action";
import { redirect } from "next/navigation";
import React from "react";

interface Props {}

const ResetPassword: React.FC<Props> = async () => {
  const user = await getServerSession();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className='flex min-h-dvh w-full justify-center items-center'>
      <ResetPasswordForm userId={user._id!} />
    </div>
  );
};

export default ResetPassword;
