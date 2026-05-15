import { ProjectWorkspace } from "@/components/projects/project-workspace";

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectDetailPage({ params }: Props) {
  const { projectId } = await params;
  return <ProjectWorkspace projectId={projectId} />;
}
