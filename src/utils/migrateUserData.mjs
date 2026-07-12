const v14Defaults = {
    streak: { currentDays: 0, lastPracticeDate: null },
    reviewQueue: [],
    sessionHistory: [],
    settings: { reminderTime: '19:00', reminderEnabled: false },
    subscription: { plusUntil: null },
};

const deadTopLevel = ['recentLists', 'newUser'];
const deadSubFields = {
    streak: ['dailyWordCount', 'dailyDate'],
    settings: ['lastSeenList', 'lastSeenMode'],
};

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export const migrateUserData = (data) => {
    if (!data) return data;
    let changed = false;
    const migrated = { ...data };

    for (const [key, defaultValue] of Object.entries(v14Defaults)) {
        if (migrated[key] === undefined) {
            migrated[key] = defaultValue;
            changed = true;
            continue;
        }
        if (isPlainObject(defaultValue) && isPlainObject(migrated[key])) {
            const merged = { ...migrated[key] };
            let subChanged = false;

            for (const [subKey, subDefault] of Object.entries(defaultValue)) {
                if (merged[subKey] === undefined) {
                    merged[subKey] = subDefault;
                    subChanged = true;
                }
            }
            for (const dead of deadSubFields[key] ?? []) {
                if (dead in merged) {
                    delete merged[dead];
                    subChanged = true;
                }
            }

            if (subChanged) {
                migrated[key] = merged;
                changed = true;
            }
        }
    }

    for (const dead of deadTopLevel) {
        if (dead in migrated) {
            delete migrated[dead];
            changed = true;
        }
    }

    return changed ? migrated : data;
};
