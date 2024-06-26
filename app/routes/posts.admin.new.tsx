import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
    Form, useActionData, useNavigation,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { createPost } from "~/models/post.server";

export const action = async ({
    request,
}: ActionFunctionArgs) => {

    const formData = await request.formData();

    const formFields: string[] = ['title', 'slug', 'markdown']

    const formInfo = formFields.reduce((formInfo, field) => {
        formInfo.fields[field] = formData.get(field)
        formInfo.errors[field] = formData.get(field) ? null : `${field} is required`

        return formInfo
    }, { errors: {}, fields: {} } as any)

    const hasErrors = Object.values(formInfo.errors).some(
        (errorMessage) => errorMessage
    );
    if (hasErrors) {
        return json(formInfo.errors);
    }

    const { title, slug, markdown } = formInfo.fields
    invariant(
        typeof title === "string",
        "title must be a string"
    );
    invariant(
        typeof slug === "string",
        "slug must be a string"
    );
    invariant(
        typeof markdown === "string",
        "markdown must be a string"
    );
    await createPost({ title, slug, markdown });

    return redirect("/posts/admin");
};

const inputClassName =
    "w-full rounded border border-gray-500 px-2 py-1 text-lg";

export default function NewPost() {
    const errors = useActionData<typeof action>();

    const navigation = useNavigation();
    const isCreating = Boolean(
        navigation.state === "submitting"
    );

    return (
        <Form method="post">
            <p>
                <label>
                    Post Title:{" "}
                    {errors?.title ? (
                        <em className="text-red-600">{errors.title}</em>
                    ) : null}
                    <input type="text" name="title" className={inputClassName} />
                </label>
            </p>
            <p>
                <label>
                    Post Slug:{" "}
                    {errors?.slug ? (
                        <em className="text-red-600">{errors.slug}</em>
                    ) : null}
                    <input type="text" name="slug" className={inputClassName} />
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
                    className={`${inputClassName} font-mono`}
                />
            </p>
            <p className="text-right">
                <button
                    type="submit"
                    className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
                    disabled={isCreating}
                >
                    {isCreating ? "Creating..." : "Create Post"}
                </button>
            </p>
        </Form>
    );
}
