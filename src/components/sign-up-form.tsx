"use client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import {
  signInValidator,
  SignInValidatorType,
} from "@/validator/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signUp } from "@/server-action/auth.action";
import { useState } from "react";
export function RegisterForm() {
  const [qrCode, setQrCode] = useState<string | undefined>(undefined);
  const form = useForm<SignInValidatorType>({
    resolver: zodResolver(signInValidator),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignUp = async (data: SignInValidatorType) => {
    try {
      const res = await signUp(data);
      if (!res.success) {
        toast.error(res.message, {
          position: "top-center",
        });
        return;
      }
      setQrCode(res.qrCode);
    } catch (error) {
      toast.error("Something went wrong", {
        position: "top-center",
      });
    }
  };

  return (
    <Card className='mx-auto w-full max-w-sm'>
      <CardHeader>
        <CardTitle className='text-2xl'>
          {!qrCode ? "Scan QR Code" : "Sign Up"}
        </CardTitle>
        <CardDescription>
          {!qrCode
            ? "Scan the QR code using your authenticator app"
            : "Enter your email below to login to your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!qrCode ? (
          <>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSignUp)}
                className='grid gap-4'
              >
                <FormField
                  control={form.control}
                  disabled={form.formState.isSubmitting}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor='email'>Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          required
                          {...field}
                          placeholder='Enter your email'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='password'
                  disabled={form.formState.isSubmitting}
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center'>
                        <FormLabel htmlFor='password'>Password</FormLabel>
                        <Link
                          href='#'
                          className='ml-auto inline-block text-sm underline'
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          required
                          autoComplete='off'
                          {...field}
                          placeholder='Enter your password'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  className='w-full'
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Please wait..." : "Sign Up"}
                </Button>
                <Button
                  variant='outline'
                  className='w-full'
                  disabled={form.formState.isSubmitting}
                >
                  Login with Google
                </Button>
              </form>
            </Form>
            <div className='mt-4 text-center text-sm'>
              Already have an account?
              <Link
                href='/sign-in'
                className='underline'
              >
                Sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className='bg-secondary size-52 mx-auto aspect-square rounded-md'>
              <img
                src={qrCode || ""}
                alt='QR Code'
                width={200}
                height={200}
              />
            </div>
            <CardDescription className='mt-2 text-foreground'>
              After Scanning QR Code, you can close this tab
            </CardDescription>
            <Button
              size='lg'
              asChild
              className='w-full mt-2 font-semibold'
            >
              <Link href='/sign-in'>Go To Login page</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
