/**
 * Sprint 526: Notification admin section extracted from admin/index.tsx
 *
 * Owns queries and mutations for notification templates, push experiments,
 * and notification insights. Renders 4 cards: insights, experiments,
 * experiment results, template manager.
 */
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotificationTemplates,
  createNotificationTemplate,
  deleteNotificationTemplate,
  updateNotificationTemplate,
  type NotificationTemplate,
} from "@/lib/api";
import { getApiUrl } from "@/lib/query-client";
import { NotificationInsightsCard, type NotificationInsightsData } from "./NotificationInsightsCard";
import { PushExperimentsCard, type PushExperimentData } from "./PushExperimentsCard";
import { ExperimentResultsCard } from "./ExperimentResultsCard";
import { TemplateManagerCard } from "./TemplateManagerCard";

interface NotificationAdminSectionProps {
  isAdmin: boolean;
}

export function NotificationAdminSection({ isAdmin }: NotificationAdminSectionProps) {
  const queryClient = useQueryClient();

  const { data: notifInsights } = useQuery<{ data: NotificationInsightsData }>({
    queryKey: ["admin-notification-insights"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/notifications/insights?daysBack=7`, { credentials: "include" });
      return res.json();
    },
    enabled: !!isAdmin,
    staleTime: 60000,
  });

  const { data: pushExperiments = [] } = useQuery<PushExperimentData[]>({
    queryKey: ["admin-push-experiments"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/admin/push-experiments`, { credentials: "include" });
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!isAdmin,
    staleTime: 60000,
  });

  const { data: notifTemplates = [] } = useQuery<NotificationTemplate[]>({
    queryKey: ["admin-notification-templates"],
    queryFn: () => fetchNotificationTemplates(),
    enabled: !!isAdmin,
    staleTime: 60000,
  });

  const handleCreateTemplate = async (input: { id: string; name: string; category: string; title: string; body: string }) => {
    await createNotificationTemplate(input);
    queryClient.invalidateQueries({ queryKey: ["admin-notification-templates"] });
  };

  const handleDeleteTemplate = async (id: string) => {
    await deleteNotificationTemplate(id);
    queryClient.invalidateQueries({ queryKey: ["admin-notification-templates"] });
  };

  const handleToggleTemplate = async (id: string, active: boolean) => {
    await updateNotificationTemplate(id, { active });
    queryClient.invalidateQueries({ queryKey: ["admin-notification-templates"] });
  };

  return (
    <>
      {notifInsights?.data && (
        <NotificationInsightsCard data={notifInsights.data} />
      )}

      <PushExperimentsCard experiments={pushExperiments} />

      <ExperimentResultsCard experiments={pushExperiments} />

      {notifTemplates && (
        <TemplateManagerCard
          templates={notifTemplates}
          onCreateTemplate={handleCreateTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onToggleActive={handleToggleTemplate}
        />
      )}
    </>
  );
}
