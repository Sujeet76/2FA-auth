import LogoutButton from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GridPattern from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import { getServerSession } from "@/server-action/auth.action";
import Image from "next/image";
import Link from "next/link";

const HomePage = async () => {
  const session = await getServerSession();

  if (session) {
    return (
      <div className='flex items-center justify-center relative min-h-dvh w-full'>
        <GridPattern
          squares={[
            [4, 4],
            [5, 1],
            [8, 2],
            [5, 3],
            [5, 5],
            [10, 10],
            [12, 15],
            [15, 20],
            [10, 15],
            [15, 11],
            [13, 15],
            [15, 10],
          ]}
          className={cn(
            "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[100%] skew-y-12"
          )}
        />
        <Card className='p-6 relative'>
          <CardTitle className='text-xl'>Welcome {session.email}</CardTitle>

          <div className='mt-4'>
            <div className='flex gap-4 items-center'>
              <div className='size-10 overflow-hidden bg-secondary rounded-full '>
                <img
                  src={session.image ?? ""}
                  alt={session.email ?? ""}
                  width={40}
                  height={40}
                  className='rounded-full size-full object-cover'
                />
              </div>
              <div>
                <p className=' font-medium'>{session.email}</p>
                <p className='text-sm text-secondary-foreground font-medium'>
                  {session.email?.split("@")[0]}
                </p>
              </div>
            </div>

            <div className='mt-4 flex items-center gap-4'>
              <Button
                size={"lg"}
                asChild
              >
                <Link href={"/reset-password"}>Reset password</Link>
              </Button>
              <LogoutButton />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-dvh w-full flex items-center justify-center'>
      <Card className='max-w-md w-full'>
        <CardHeader>
          <CardTitle className='text-xl'>Please sign in to continue</CardTitle>
        </CardHeader>
        <CardContent className='flex w-full gap-3 items-center'>
          <Button
            size={"lg"}
            className='w-full font-semibold text-base'
            asChild
          >
            <Link href='/sign-in'>Log in</Link>
          </Button>
          <Button
            size={"lg"}
            variant={"secondary"}
            asChild
            className='w-full font-semibold text-base'
          >
            <Link href='/sign-up'>Sign up</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
