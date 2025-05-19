import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { NextLayout } from "@/Layouts/NextLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import axios from "axios";
import { FormEventHandler } from "react";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: "",
        password: "",
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    const handleConnectwareSignIn = () => {
        axios
            .post(route("connectware.login"))
            .then((res: any) => {
                if (res.data?.url) {
                    window.location.href = res.data?.url;
                }
            })
            .catch((err: any) => {
                console.log(err.response.data);
            });
    };

    return (
        <NextLayout>
            <div className="w-full h-screen flex bg-gray-50 dark:bg-gray-900">
                <Head title="Log in" />

                <div className="w-full max-w-lg m-auto bg-gray-50 dark:bg-gray-900">
                    {status && (
                        <div className=" text-red-700  dark:text-red-400 rounded-3xl mb-2 p-4 text-center">
                            {status}
                        </div>
                    )}
                    <div className="phone-container bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                        <form onSubmit={submit}>
                            <div className="mb-6">
                                <div className="relative">
                                    <InputLabel
                                        htmlFor="username"
                                        value="Username"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        className={`w-full mt-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-0 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                                        value={data.username}
                                        id="username"
                                        name="username"
                                        onChange={(e) =>
                                            setData("username", e.target.value)
                                        }
                                    />
                                </div>
                                <InputError
                                    message={errors.username}
                                    className="mt-2"
                                />
                            </div>
                            <div className="mb-6">
                                <div className="relative">
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Username"
                                        className={`w-full mt-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-0 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                                        id="password"
                                        name="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                    />
                                </div>
                                <InputError
                                    message={errors.password}
                                    className="mt-2"
                                />
                            </div>
                            <PrimaryButton
                                disabled={processing}
                                className="dark:bg-gray-700 dark:hover:bg-gray-900"
                            >
                                Log in
                            </PrimaryButton>
                            <br></br>
                            <PrimaryButton
                                type="button"
                                disabled={processing}
                                className="dark:bg-gray-700 dark:hover:bg-gray-900 mt-2"
                                onClick={handleConnectwareSignIn}
                            >
                                Sign in with Connectware
                            </PrimaryButton>
                        </form>
                    </div>
                </div>
            </div>
        </NextLayout>
    );
}
