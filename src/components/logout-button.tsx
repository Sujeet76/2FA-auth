"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { logout } from "@/server-action/auth.action";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const LogoutButton = ({ className }: { className?: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const logoutHandler = async () => {
    setIsLoading(true);
    await logout();
    setIsLoading(false);
    router.refresh();
  };
  return (
    <Button
      variant={"destructive"}
      className={cn("w-full font-semibold", className)}
      size={"lg"}
      onClick={logoutHandler}
    >
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
};

export default LogoutButton;
