import { useNavigate } from "react-router-dom";
import { DrillForm } from "@/components/drills";
import { AppShell } from "@/components/layout/AppShell";

/**
 * AddDrillPage - Page for creating new drills
 *
 * Features:
 * - Wraps DrillForm in AppShell layout
 * - Navigates to drill library (/drills) on success
 * - Max-width container for optimal form readability
 */
export function AddDrillPage() {
  const navigate = useNavigate();

  const handleSuccess = (_drillId: string) => {
    // Navigate to drill library after successful creation
    // Use /drills for now (Phase 8 will create this page)
    navigate("/drills");
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Drill</h1>
        <DrillForm onSuccess={handleSuccess} />
      </div>
    </AppShell>
  );
}
