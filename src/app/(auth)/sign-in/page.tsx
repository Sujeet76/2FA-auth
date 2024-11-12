import { LoginForm } from "@/components/login-form";
import { getServerSession } from "@/server-action/auth.action";
import { redirect } from "next/navigation";
import React from "react";

const SignInPage = async () => {
  const user = await getServerSession();
  if (user) {
    return redirect("/");
  }

  return (
    <div className='flex h-screen w-full items-center justify-center px-4'>
      <LoginForm />
    </div>
  );
};

export default SignInPage;
