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
  FormDescription,
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
import { useState } from "react";
import { z } from "zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { signIn, verifyTwoFactorAuth } from "@/server-action/auth.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SuccessRes = {
  success: boolean;
  message: string;
  data: {
    userId: string;
    requiredTwoFactorAuth: boolean;
  };
};

const OTPForm = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export function LoginForm() {
  const router = useRouter();
  const [isTwoFAEnabled, setIsTwoFAEnabled] = useState(false);
  const [userId, setUserId] = useState("");
  const form = useForm<SignInValidatorType>({
    resolver: zodResolver(signInValidator),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const otpForm = useForm<z.infer<typeof OTPForm>>({
    resolver: zodResolver(OTPForm),
    defaultValues: {
      pin: "",
    },
  });

  const handleSignIn = async (data: SignInValidatorType) => {
    try {
      const res = await signIn(data);
      if (!res.success) {
        toast.error(res.message, {
          position: "top-center",
        });
        return;
      }

      const resData = (res as unknown as SuccessRes).data;

      setIsTwoFAEnabled(resData.requiredTwoFactorAuth);
      setUserId(resData.userId);
    } catch (error) {
      toast.error("Something went wrong", {
        position: "top-center",
      });
    }
  };

  const verifyTOTP = async (data: z.infer<typeof OTPForm>) => {
    try {
      const res = await verifyTwoFactorAuth({
        code: data.pin,
        userId,
      });

      if (!res.success) {
        toast.error(res.message, {
          position: "top-center",
        });
        return;
      }

      toast.success(res.message, {
        position: "top-center",
      });

      router.push("/");
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
          {isTwoFAEnabled ? "OTP verification" : "Login"}
        </CardTitle>
        <CardDescription>
          To get your OTP code, open your 2FA app
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isTwoFAEnabled ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSignIn)}
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
                        type='password'
                        required
                        {...field}
                        autoComplete='off'
                        placeholder='Enter your password'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type='submit'
                className='w-full'
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Please wait..." : "Login"}
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
        ) : (
          <div>
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(verifyTOTP)}>
                <FormField
                  control={otpForm.control}
                  name='pin'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One-Time Password</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          {...field}
                          disabled={otpForm.formState.isSubmitting}
                        >
                          <InputOTPGroup className='w-full'>
                            <InputOTPSlot
                              className='w-full h-10'
                              index={0}
                            />
                            <InputOTPSlot
                              className='w-full h-10'
                              index={1}
                            />
                            <InputOTPSlot
                              className='w-full h-10'
                              index={2}
                            />
                            <InputOTPSlot
                              className='w-full h-10'
                              index={3}
                            />
                            <InputOTPSlot
                              className='w-full h-10'
                              index={4}
                            />
                            <InputOTPSlot
                              className='w-full h-10'
                              index={5}
                            />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription>
                        Please enter the one-time password sent to your phone.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  className='w-full mt-3'
                  disabled={otpForm.formState.isSubmitting}
                >
                  {otpForm.formState.isSubmitting ? "Please wait..." : "Verify"}
                </Button>
              </form>
            </Form>
          </div>
        )}
        <div className='mt-4 text-center text-sm'>
          Don&apos;t have an account?{" "}
          <Link
            href='/sign-up'
            className='underline'
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
