"use client";

import { createContext, useContext } from "react";

/**
 * True when the admin panel is viewed by a visitor (no admin session).
 * This only hides editing controls: the API rejects every write without an admin session anyway.
 */
const ReadOnlyContext = createContext(true);

export const ReadOnlyProvider = ReadOnlyContext.Provider;

export const useReadOnly = (): boolean => useContext(ReadOnlyContext);
