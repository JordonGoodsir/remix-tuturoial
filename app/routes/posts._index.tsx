import { LoaderFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getUser } from "~/session.server"
import { getPostListings } from "~/models/post.server";

type LoaderData = {
    posts: Awaited<ReturnType<typeof getPostListings>>
    isAuthenticated: boolean
}

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
    const test = await getUser(request)
    const isAuthenticated = !!test?.email
    return json<LoaderData>({ posts: await getPostListings(), isAuthenticated });

};

export default function PostsRoute() {
    const { posts, isAuthenticated } = useLoaderData() as LoaderData;
    return (
        <main>
            <h1>Posts</h1>
            {isAuthenticated ? <Link to="admin" className="text-red-600 underline">
                Admin
            </Link> : null}
            <ul>
                {posts.map((post) => (
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