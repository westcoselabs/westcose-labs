import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SettingsRoute } from "@/components/apps/settings/SettingsRoute";
import {
  createRouteMetadata,
  getSettingsCategory,
  settingsCategoryRegistry,
  type SettingsCategoryId,
} from "@/registry";

type SettingsCategoryPageProps = {
  readonly params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return settingsCategoryRegistry.map((category) => ({
    category: category.id,
  }));
}

export async function generateMetadata({
  params,
}: SettingsCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const definition = getSettingsCategory(category);
  return createRouteMetadata({
    title: definition?.label ?? "Settings",
    description: definition?.description ?? "WestCose OS settings.",
    path: `/settings/${encodeURIComponent(category)}`,
  });
}

export default async function SettingsCategoryPage({
  params,
}: SettingsCategoryPageProps) {
  const { category } = await params;
  if (!getSettingsCategory(category)) notFound();
  return (
    <SettingsRoute
      view={{ kind: "category", categoryId: category as SettingsCategoryId }}
    />
  );
}
