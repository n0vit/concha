import { Epoch, phase0 } from "@lodestar/types";

export function isActiveValidator(
  validator: phase0.Validator,
  epoch: Epoch
): boolean {
  return validator.activationEpoch <= epoch && epoch < validator.exitEpoch;
}
