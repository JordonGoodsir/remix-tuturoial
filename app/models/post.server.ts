import { prisma } from "~/db.server";
import type { Post } from "@prisma/client";

export async function getPostListings() {
    return prisma.post.findMany({
        select: {
            slug: true,
            title: true
        }
    })
}

export async function getPosts() {
    return prisma.post.findMany();
}

export async function getPost(slug: string) {
    return prisma.post.findUnique({ where: { slug } });
}

export async function createPost(
    post: Pick<Post, "slug" | "title" | "markdown">
) {
    return prisma.post.create({ data: post });
}

export async function updatePost(
    slug: string,
    updatedPost: Pick<Post, "slug" | "title" | "markdown">,
) {
    return prisma.post.update({ where: { slug }, data: updatedPost, });
}

export async function deletePost(slug: string) {
    return prisma.post.delete({ where: { slug } });
}