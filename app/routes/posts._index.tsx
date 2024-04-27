import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getUser } from "../session.server"

import { getPosts } from "~/models/post.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const test = await getUser(request)
    const isAuthenticated = !!test?.email
    return json({ posts: await getPosts(), isAuthenticated });

};

export default function Posts() {
    const { posts, isAuthenticated } = useLoaderData<typeof loader>();
    return (
        <main>
            <h1>Posts</h1>
            {isAuthenticated ? <Link to="admin" className="text-red-600 underline">
                Admin
            </Link> : null}
            <ul>
                {posts.map((post: any) => (
                    <li key={post.slug}>
                        <Link
                            to={post.slug}
                            className="text-blue-600 underline"
                        >
                            {post.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    );
}