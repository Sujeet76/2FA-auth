"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPassword,
  verifyTwoFactorAuth,
} from "@/server-action/auth.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Props {
  userId: string;
}

const OTPForm = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

const ResetPasswordFormSchema = z.object({
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/, {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
});

type ResetPasswordFormType = z.infer<typeof ResetPasswordFormSchema>;

type OTPFormType = z.infer<typeof OTPForm>;

const ResetPasswordForm: React.FC<Props> = (props) => {
  const [isVerified, setIsVerified] = React.useState(false);
  const router = useRouter();

  const resetFrom = useForm<ResetPasswordFormType>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const otpForm = useForm<OTPFormType>({
    resolver: zodResolver(OTPForm),
    defaultValues: {
      pin: "",
    },
  });

  const onSubmitOTP = async (data: OTPFormType) => {
    try {
      const res = await verifyTwoFactorAuth({
        code: data.pin,
        userId: props.userId,
      });

      if (!res.success) {
        toast.error(res.message, {
          position: "top-center",
        });
        setIsVerified(false);
        return;
      }

      toast.success("Proceed to next step", {
        position: "top-center",
      });
      setIsVerified(true);
    } catch (error) {
      toast.error("Something went wrong", {
        position: "top-center",
      });
    }
  };

  const onSubmitReset = async (data: ResetPasswordFormType) => {
    try {
      const res = await resetPassword(data);

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
    <Card className='max-w-md'>
      <CardHeader>
        <CardTitle>Enter your OTP</CardTitle>
        <CardDescription>
          Enter the OTP sent to your email to reset your password and to get
          your opt open the your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isVerified ? (
          <div>
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onSubmitOTP)}>
                <FormField
                  control={otpForm.control}
                  name='pin'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One-Time Password</FormLabel>
                      <FormControl>
                        <InputOTP
                          disabled={otpForm.formState.isSubmitting}
                          maxLength={6}
                          {...field}
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
                        Please enter the one-time password using the
                        authenticator app.
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
                  {otpForm.formState.isSubmitting
                    ? "Please wait..."
                    : "Verify OTP"}
                </Button>
              </form>
            </Form>
          </div>
        ) : (
          <Form {...resetFrom}>
            <form
              onSubmit={resetFrom.handleSubmit(onSubmitReset)}
              className='grid gap-4'
            >
              <FormField
                control={resetFrom.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='email'>New Password</FormLabel>
                    <FormControl>
                      <Input
                        disabled={resetFrom.formState.isSubmitting}
                        type='password'
                        required
                        {...field}
                        placeholder='Enter your new password'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type='submit'
                className='w-full'
                disabled={resetFrom.formState.isSubmitting}
              >
                {resetFrom.formState.isSubmitting
                  ? "Please wait..."
                  : "Reset Password"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default ResetPasswordForm;
