import React from 'react';

const AlertsTab = ({ notifications, markNotificationRead }) => {
  return (
    <div className="max-w-xl mx-auto glass-panel p-6 border-slate-900 bg-slate-900/30 space-y-4">
      <h3 className="text-lg font-bold text-slate-100 mb-4 border-b border-slate-900 pb-3">Alert History Log</h3>
      {notifications.length === 0 ? (
        <p className="text-slate-500 text-center py-6 text-xs">No alerts received.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, index) => (
            <React.Fragment key={notif.id}>
              <div className={`pt-3 flex justify-between items-start gap-4 ${!notif.isRead ? 'bg-cyan-950/10 p-3 rounded-lg border border-cyan-900/10' : ''}`}>
                <div className="text-xs">
                  <span className="text-slate-500 font-semibold block">{new Date(notif.createdAt).toLocaleString()}</span>
                  <h4 className="font-bold text-slate-200 mt-1">{notif.title}</h4>
                  <p className="text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                </div>

                {!notif.isRead && (
                  <button
                    onClick={() => markNotificationRead(notif.id)}
                    className="btn-secondary py-1 px-3 text-[10px] rounded hover:border-cyan-500/30 text-cyan-400 font-semibold cursor-pointer"
                  >
                    Read
                  </button>
                )}
              </div>
              {index < notifications.length - 1 && (
                <hr className="border-slate-700/60 my-3" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsTab;
