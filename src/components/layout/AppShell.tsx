import { useState } from "react";
import { Header } from "./Header";
import { TaskList } from "../tasks/TaskList";
import { TaskModal } from "../tasks/TaskModal";
import { TimetableView } from "../timetable/TimetableView";
import { SettingsPage } from "../settings/SettingsPage";
import { useSettingsStore } from "../../stores/settingsStore";

export const AppShell = () => {
  const { activeTab } = useSettingsStore();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const handleAddTask = () => {
    setEditingTaskId(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (id: string) => {
    setEditingTaskId(id);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setEditingTaskId(null);
  };

  return (
    <div className="app-container">
      <Header />

      <div className="content">
        {activeTab === "tasks" && (
          <TaskList onAddTask={handleAddTask} onEditTask={handleEditTask} />
        )}
        {activeTab === "timetable" && <TimetableView />}
        {activeTab === "settings" && <SettingsPage />}
      </div>

      <TaskModal
        isOpen={showTaskModal}
        onClose={handleCloseModal}
        editingTaskId={editingTaskId}
      />
    </div>
  );
};
