import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
    useLoaderData, Form, useActionData, useNavigation,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { getPost, updatePost, deletePost } from "~/models/post.server";

export const loader = async ({
    params,
}: LoaderFunctionArgs) => {
    invariant(params.slug, "params.slug is required");

    const post = await getPost(params.slug);
    invariant(post, `Post not found: ${params.slug}`);

    return json({ post });
};

export const action = async (data: ActionFunctionArgs) => {

    const formData = await data.request.formData();
    const intent = formData.get('intent')

    // update request
    if (intent === 'delete') {
        await deletePost(data.params.slug as string)
        return redirect("/posts/admin");
    }

    // post request
    const oldPost = await getPost(data.params.slug);

    const formFields: string[] = ['title', 'slug', 'markdown']

    const formInfo = formFields.reduce((formInfo, field) => {
        formInfo.fields[field] = formData.get(field)

        if (!formData.get(field)) {
            formInfo.errors[field] = `${field} is required`
        }

        return formInfo
    }, { errors: {}, fields: {} } as any)

    const postHasChanged = formFields.map((key) => oldPost[key] === formInfo.fields[key]).filter((val) => !val).length

    if (!postHasChanged) formInfo.errors.global = "Must change at least one field to updated"

    const hasErrors = Object.values(formInfo.errors).some(
        (errorMessage) => errorMessage
    );

    if (hasErrors) {
        return json(formInfo.errors)
    }

    await updatePost(data.params.slug, formInfo.fields);
    return redirect("/posts/admin");
};

const inputClassName =
    "w-full rounded border border-gray-500 px-2 py-1 text-lg";

export default function PostSlug() {
    const { post } = useLoaderData<typeof loader>();
    const errors = useActionData<typeof action>();
    const navigation = useNavigation();
    const isCreating = Boolean(
        navigation.state === "submitting"
    );
    return (
        <div>
            <Form method="put">
                <p>   {errors?.global ? (
                    <em className="text-red-600">{errors?.global}</em>
                ) : null}</p>
                <p>
                    <label>
                        Post Title:{" "}
                        {errors?.title ? (
                            <em className="text-red-600">{errors.title}</em>
                        ) : null}
                        <input defaultValue={post.title} type="text" name="title" className={inputClassName} />
                    </label>
                </p>
                <p>
                    <label>
                        Post Slug:{" "}
                        {errors?.slug ? (
                            <em className="text-red-600">{errors.slug}</em>
                        ) : null}
                        <input defaultValue={post.slug} type="text" name="slug" className={inputClassName} />
                    </label>
                </p>
                <p>
                    <label htmlFor="markdown">
                        Markdown:{" "}
                        {errors?.markdown ? (
                            <em className="text-red-600">
                                {errors.markdown}
                            </em>
                        ) : null}
                    </label>
                    <br />
                    <textarea
                        id="markdown"
                        rows={20}
                        name="markdown"
                        defaultValue={post.markdown}
                        className={`${inputClassName} font-mono`}
                    />
                </p>
                <div className="text-right flex gap-5">
                    <button
                        type="submit"
                        className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
                        disabled={isCreating}
                    >
                        {isCreating ? "Creating..." : "Update Post"}
                    </button>
                    <button
                        type="submit"
                        name="intent"
                        value="delete"
                        className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
                    >
                        Delete
                    </button>
                </div>
            </Form>
        </div>
    );
}