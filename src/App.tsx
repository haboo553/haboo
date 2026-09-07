import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ToastProvider } from './context/ToastContext.js';

// Layout Components
import { Sidebar } from './components/Sidebar.js';
import { Navbar } from './components/Navbar.js';
import { MobileBottomNav } from './components/MobileBottomNav.js';

// Global Modals
import { GlobalSearchModal } from './components/GlobalSearchModal.js';
import { NotificationDrawer } from './components/NotificationDrawer.js';
import { UpgradeModal } from './components/UpgradeModal.js';
import { LessonPrepModal } from './components/LessonPrepModal.js';
import { ParentMessageModal } from './components/ParentMessageModal.js';
import { QrAttendanceModal } from './components/QrAttendanceModal.js';

// Views
import { LandingPageView } from './views/LandingPageView.js';
import { DashboardView } from './views/DashboardView.js';
import { ScheduleView } from './views/ScheduleView.js';
import { GroupsView } from './views/GroupsView.js';
import { StudentsView } from './views/StudentsView.js';
import { StudentProfileView } from './views/StudentProfileView.js';
import { AttendanceView } from './views/AttendanceView.js';
import { ExamsView } from './views/ExamsView.js';
import { HomeworkView } from './views/HomeworkView.js';
import { EvaluationsView } from './views/EvaluationsView.js';
import { AiAssistantView } from './views/AiAssistantView.js';
import { ReportsView } from './views/ReportsView.js';
import { SubscriptionView } from './views/SubscriptionView.js';
import { FinancialDashboardView } from './views/FinancialDashboardView.js';
import { AdminDashboardView } from './views/AdminDashboardView.js';
import { SettingsView } from './views/SettingsView.js';

const MainAppContent: React.FC = () => {
  const { user, loading, subscriptionStatus, isTrialExpired } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedAttendanceGroupId, setSelectedAttendanceGroupId] = useState<string | undefined>(undefined);

  // Modals state
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Dynamic Modals data
  const [lessonPrepData, setLessonPrepData] = useState<{ isOpen: boolean; lessonId: string; title: string; subject: string }>({
    isOpen: false,
    lessonId: '',
    title: '',
    subject: ''
  });

  const [parentMessageData, setParentMessageData] = useState<{ isOpen: boolean; student: any }>({
    isOpen: false,
    student: null
  });

  const [qrModalData, setQrModalData] = useState<{ isOpen: boolean; groupName: string; groupCode: string }>({
    isOpen: false,
    groupName: '',
    groupCode: ''
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center font-bold text-2xl animate-pulse">
            مُ
          </div>
          <span className="text-xs font-bold text-slate-400">جاري تحميل منصة مُعين...</span>
        </div>
      </div>
    );
  }

  // If unauthenticated, show the Landing Page
  if (!user) {
    return (
      <LandingPageView
        onOpenLogin={() => {}}
        onOpenRegister={() => {}}
      />
    );
  }

  const handleNavigate = (tab: string, extra?: any) => {
    setSelectedStudentId(null);
    if (tab === 'attendance' && extra?.groupId) {
      setSelectedAttendanceGroupId(extra.groupId);
    }
    setActiveTab(tab);
  };

  const handleOpenLessonPrep = (lessonId?: string, title?: string, subject?: string) => {
    setLessonPrepData({
      isOpen: true,
      lessonId: lessonId || '',
      title: title || 'تحضير درس نموذجي',
      subject: subject || 'عام'
    });
  };

  const handleOpenParentMessage = (student: any) => {
    setParentMessageData({
      isOpen: true,
      student
    });
  };

  const handleOpenQrModal = (groupName: string, groupCode: string) => {
    setQrModalData({
      isOpen: true,
      groupName,
      groupCode
    });
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={selectedStudentId ? 'students' : activeTab}
        onNavigate={handleNavigate}
        onOpenUpgrade={() => setUpgradeOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenUpgrade={() => setUpgradeOpen(true)}
          activeTab={selectedStudentId ? 'student-profile' : activeTab}
          onQuickAction={(action) => {
            if (action === 'ai-prep') handleOpenLessonPrep();
            if (action === 'add-student') handleNavigate('students');
          }}
        />

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {/* Subscription Expiry / Warning Banner */}
          {user.role === 'teacher' && isTrialExpired && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-rose-900 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0">
                  ⚠️
                </span>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm">انتهت فترة التجربة المجانية لحسابك</h4>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    البيانات محفوظة في وضع القراءة فقط. يرجى الاشتراك في باقة المحترف لمتابعة تسجيل الحصص والذكاء الاصطناعي.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUpgradeOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 shrink-0"
              >
                ترقية الحساب الآن
              </button>
            </div>
          )}

          {selectedStudentId ? (
            <StudentProfileView
              studentId={selectedStudentId}
              onBack={() => setSelectedStudentId(null)}
              onOpenParentMessage={handleOpenParentMessage}
              onOpenAiStudentAnalysis={(student) => {
                handleNavigate('ai-assistant');
              }}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  onNavigate={handleNavigate}
                  onOpenLessonPrep={handleOpenLessonPrep}
                  onOpenAddStudent={() => handleNavigate('students')}
                  onOpenAttendance={(groupId) => {
                    setSelectedAttendanceGroupId(groupId);
                    handleNavigate('attendance');
                  }}
                  onSelectStudent={handleSelectStudent}
                />
              )}

              {activeTab === 'schedule' && (
                <ScheduleView
                  onOpenLessonPrep={handleOpenLessonPrep}
                  onOpenAttendance={(groupId) => {
                    setSelectedAttendanceGroupId(groupId);
                    handleNavigate('attendance');
                  }}
                />
              )}

              {activeTab === 'groups' && (
                <GroupsView
                  onOpenQrModal={handleOpenQrModal}
                  onNavigateToStudents={(groupId) => {
                    handleNavigate('students');
                  }}
                  onOpenAttendance={(groupId) => {
                    setSelectedAttendanceGroupId(groupId);
                    handleNavigate('attendance');
                  }}
                  onOpenAiGroupAnalysis={(group) => {
                    handleNavigate('ai-assistant');
                  }}
                />
              )}

              {activeTab === 'students' && (
                <StudentsView
                  onSelectStudent={handleSelectStudent}
                  onOpenParentMessage={handleOpenParentMessage}
                  onOpenAiStudentAnalysis={(student) => {
                    handleNavigate('ai-assistant');
                  }}
                />
              )}

              {activeTab === 'attendance' && (
                <AttendanceView
                  initialGroupId={selectedAttendanceGroupId}
                  onOpenQrModal={handleOpenQrModal}
                />
              )}

              {activeTab === 'financial' && (
                <FinancialDashboardView
                  onSelectStudent={handleSelectStudent}
                />
              )}

              {activeTab === 'exams' && (
                <ExamsView
                  onOpenAiQuizGenerator={() => handleNavigate('ai-assistant')}
                />
              )}

              {activeTab === 'homework' && <HomeworkView />}

              {activeTab === 'evaluations' && <EvaluationsView />}

              {activeTab === 'ai-assistant' && <AiAssistantView />}

              {activeTab === 'reports' && <ReportsView />}

              {activeTab === 'subscription' && (
                <SubscriptionView
                  onOpenUpgradeModal={() => setUpgradeOpen(true)}
                />
              )}

              {activeTab === 'admin' && <AdminDashboardView />}

              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeTab={selectedStudentId ? 'students' : activeTab}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
        onSelectStudent={handleSelectStudent}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNavigate={handleNavigate}
      />

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
      />

      <LessonPrepModal
        isOpen={lessonPrepData.isOpen}
        onClose={() => setLessonPrepData(prev => ({ ...prev, isOpen: false }))}
        lessonId={lessonPrepData.lessonId}
        lessonTitle={lessonPrepData.title}
        subject={lessonPrepData.subject}
      />

      {parentMessageData.student && (
        <ParentMessageModal
          isOpen={parentMessageData.isOpen}
          onClose={() => setParentMessageData({ isOpen: false, student: null })}
          student={parentMessageData.student}
        />
      )}

      <QrAttendanceModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData(prev => ({ ...prev, isOpen: false }))}
        groupName={qrModalData.groupName}
        groupCode={qrModalData.groupCode}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
