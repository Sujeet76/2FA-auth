import { RegisterForm } from "@/components/sign-up-form";
import { getServerSession } from "@/server-action/auth.action";
import { redirect } from "next/navigation";
import React from "react";

const SignUpPage = async () => {
  const user = await getServerSession();

  if (user) {
    redirect("/");
  }
  return (
    <div className='flex h-screen w-full items-center justify-center px-4'>
      <RegisterForm />
    </div>
  );
};

export default SignUpPage;
