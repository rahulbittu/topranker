/**
 * Sprint 522: Admin notification template management card.
 *
 * Displays templates with variable badges, category tags, and active/inactive
 * status. Provides create form with live variable preview. Integrates into
 * admin dashboard overview tab.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import type { NotificationTemplate } from "@/lib/api";

interface TemplateManagerCardProps {
  templates: NotificationTemplate[];
  onCreateTemplate: (input: {
    id: string; name: string; category: string; title: string; body: string;
  }) => void;
  onDeleteTemplate: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  weeklyDigest: BRAND.colors.amber,
  rankingChange: Colors.green,
  newRating: "#6366F1",
  cityHighlights: "#0EA5E9",
};

function VariableBadge({ name }: { name: string }) {
  return (
    <View style={styles.varBadge}>
      <Text style={styles.varText}>{`{${name}}`}</Text>
    </View>
  );
}

function TemplateRow({
  template,
  onDelete,
  onToggle,
}: {
  template: NotificationTemplate;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const catColor = CATEGORY_COLORS[template.category] || Colors.textTertiary;
  return (
    <View style={styles.templateRow}>
      <View style={styles.templateHeader}>
        <View style={[styles.categoryTag, { backgroundColor: `${catColor}20` }]}>
          <Text style={[styles.categoryText, { color: catColor }]}>{template.category}</Text>
        </View>
        <View style={styles.templateActions}>
          <TouchableOpacity onPress={onToggle} style={styles.actionBtn}>
            <Ionicons
              name={template.active ? "checkmark-circle" : "ellipse-outline"}
              size={18}
              color={template.active ? Colors.green : Colors.textTertiary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={16} color={Colors.red} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.templateName}>{template.name}</Text>
      <Text style={styles.templateTitle}>{template.title}</Text>
      <Text style={styles.templateBody}>{template.body}</Text>
      {template.variables.length > 0 && (
        <View style={styles.varRow}>
          {template.variables.map((v) => (
            <VariableBadge key={v} name={v} />
          ))}
        </View>
      )}
    </View>
  );
}

export function TemplateManagerCard({
  templates,
  onCreateTemplate,
  onDeleteTemplate,
  onToggleActive,
}: TemplateManagerCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("weeklyDigest");
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");

  const handleCreate = () => {
    if (!formName.trim() || !formTitle.trim() || !formBody.trim()) {
      Alert.alert("Missing Fields", "Name, title, and body are required.");
      return;
    }
    const id = formName.toLowerCase().replace(/\s+/g, "-").slice(0, 40);
    onCreateTemplate({ id, name: formName, category: formCategory, title: formTitle, body: formBody });
    setFormName("");
    setFormTitle("");
    setFormBody("");
    setShowForm(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Ionicons name="document-text-outline" size={18} color={BRAND.colors.amber} />
          <Text style={styles.cardTitle}>Push Templates</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{templates.length}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addBtn}>
          <Ionicons name={showForm ? "close" : "add"} size={18} color={BRAND.colors.amber} />
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Template name" placeholderTextColor={Colors.textTertiary} value={formName} onChangeText={setFormName} />
          <View style={styles.categoryPicker}>
            {["weeklyDigest", "rankingChange", "newRating", "cityHighlights"].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catOption, formCategory === cat && styles.catOptionActive]}
                onPress={() => setFormCategory(cat)}
              >
                <Text style={[styles.catOptionText, formCategory === cat && styles.catOptionTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} placeholder="Notification title" placeholderTextColor={Colors.textTertiary} value={formTitle} onChangeText={setFormTitle} />
          <TextInput style={[styles.input, styles.bodyInput]} placeholder="Notification body (use {firstName}, {city}, etc.)" placeholderTextColor={Colors.textTertiary} value={formBody} onChangeText={setFormBody} multiline />
          <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
            <Text style={styles.createBtnText}>Create Template</Text>
          </TouchableOpacity>
        </View>
      )}

      {templates.length === 0 && !showForm && (
        <Text style={styles.empty}>No templates yet. Tap + to create one.</Text>
      )}

      {templates.map((t) => (
        <TemplateRow
          key={t.id}
          template={t}
          onDelete={() => onDeleteTemplate(t.id)}
          onToggle={() => onToggleActive(t.id, !t.active)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Colors.cardShadow,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  countBadge: {
    backgroundColor: `${BRAND.colors.amber}20`,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: { fontSize: 11, fontWeight: "700", color: BRAND.colors.amber, fontFamily: "DMSans_700Bold" },
  addBtn: { padding: 4 },
  form: { marginBottom: 12, gap: 8 },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.text,
    fontFamily: "DMSans_400Regular",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bodyInput: { minHeight: 60, textAlignVertical: "top" },
  categoryPicker: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  catOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catOptionActive: { backgroundColor: `${BRAND.colors.amber}20`, borderColor: BRAND.colors.amber },
  catOptionText: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_500Medium" },
  catOptionTextActive: { color: BRAND.colors.amber },
  createBtn: {
    backgroundColor: BRAND.colors.amber,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  createBtnText: { fontSize: 13, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold" },
  empty: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", textAlign: "center", paddingVertical: 16 },
  templateRow: {
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  templateHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  templateActions: { flexDirection: "row", gap: 8 },
  actionBtn: { padding: 2 },
  categoryTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  categoryText: { fontSize: 10, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
  templateName: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  templateTitle: { fontSize: 12, color: Colors.text, fontFamily: "DMSans_500Medium", marginTop: 2 },
  templateBody: { fontSize: 11, color: Colors.subtext, fontFamily: "DMSans_400Regular", marginTop: 2 },
  varRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 },
  varBadge: {
    backgroundColor: `${BRAND.colors.amber}15`,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  varText: { fontSize: 10, color: BRAND.colors.amber, fontFamily: "DMSans_500Medium" },
});
