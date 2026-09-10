import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/ProductDetailPage";
import { company } from "@/lib/content";
import {
  defaultSiteContent,
  getProductCard,
  getProductIds,
} from "@/lib/site-content";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getProductIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductCard(defaultSiteContent, id);
  if (!product) return {};

  return {
    title: product.name,
    description: product.pageDescription,
    openGraph: {
      title: `${product.name} | ${company.name}`,
      description: product.pageDescription,
      images: [
        {
          url: product.tileImage,
          width: 1024,
          height: 1024,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = getProductCard(defaultSiteContent, id);
  if (!product) notFound();

  return <ProductDetailPage productId={id} />;
}
