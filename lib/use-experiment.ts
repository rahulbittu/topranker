/**
 * useExperiment hook — thin wrapper around the A/B testing framework.
 *
 * Returns the assigned variant for an experiment and tracks exposure once on mount.
 *
 * Usage:
 *   const { variant, isControl, isTreatment } = useExperiment('confidence_tooltip');
 *
 * Owner: Sarah Nakamura (Lead Engineer)
 */
import { useMemo, useEffect, useRef } from "react";
import { getVariant, trackExperiment } from "./ab-testing";

export interface UseExperimentResult {
  /** The assigned variant id, e.g. "control" or "treatment" */
  variant: string;
  /** True when the user is in the control group */
  isControl: boolean;
  /** True when the user is in the treatment group */
  isTreatment: boolean;
}

export function useExperiment(experimentId: string): UseExperimentResult {
  const variant = useMemo(() => getVariant(experimentId), [experimentId]);
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      trackExperiment(experimentId);
      tracked.current = true;
    }
  }, [experimentId]);

  return useMemo(
    () => ({
      variant,
      isControl: variant === "control",
      isTreatment: variant === "treatment",
    }),
    [variant],
  );
}
