"""Offline contract tests with authored responses; these do not test Jev quality."""
import copy
import unittest
from rank_checks import MODEL, load_case, prepare, rank_response, run_case


def authored_response(request, level=2):
    return {"model": MODEL, "answers": {
        qid: {"type": "score", "score": float(level), "confidence": 1.0,
              "probabilities": {str(i): float(i == level) for i in range(4)}}
        for qid in request["questions"]}, "usage": {"input_tokens": 100, "output_tokens": 50}}


class RankingContracts(unittest.TestCase):
    def test_required_recovery_never_calls_model(self):
        def forbidden(_): raise AssertionError("Recovery must bypass the model")
        result = run_case("04_required_recovery", live=True, transport=forbidden)
        self.assertEqual(result["precedence_ids"], ["c1"])
        self.assertEqual(result["api_calls"], 0)

    def test_explicit_priority_never_calls_model(self):
        def forbidden(_): raise AssertionError("Single explicit priority needs no model")
        result = run_case("05_explicit_human_priority", live=True, transport=forbidden)
        self.assertEqual(result["precedence_ids"], ["c2"])

    def test_ineligible_candidate_is_removed_before_request(self):
        state, control = load_case("01_finish_journey")
        control["c1"]["eligible"] = False
        request, gate = prepare(state, control)
        self.assertIsNone(gate)
        self.assertEqual([c["id"] for c in request["state"]["candidates"]], ["c2", "c3"])
        self.assertEqual(len(request["questions"]), 4)

    def test_empty_set_does_not_call_model(self):
        request, gate = prepare({"candidates": []}, {})
        self.assertIsNone(request)
        self.assertEqual(gate["status"], "no_eligible_candidates")

    def test_weak_scores_do_not_force_a_winner(self):
        request, _ = prepare(*load_case("06_existing_eight_only"))
        result = rank_response(request, authored_response(request, level=0))
        self.assertEqual(result["status"], "weak_candidates")
        self.assertIsNone(result["suggested_id"])

    def test_missing_answer_falls_back(self):
        def incomplete(request):
            response = authored_response(request)
            del response["answers"][next(iter(response["answers"]))]
            return response, "test-only"
        result = run_case("01_finish_journey", live=True, transport=incomplete)
        self.assertEqual(result["status"], "unavailable")
        self.assertIsNone(result["suggested_id"])

    def test_nonfinite_response_is_rejected(self):
        request, _ = prepare(*load_case("01_finish_journey"))
        response = authored_response(request)
        response["answers"]["c0_information"]["score"] = float("nan")
        with self.assertRaises(ValueError): rank_response(request, response)

    def test_candidate_positions_stay_bound_to_ids_after_reordering(self):
        state, control = load_case("01_finish_journey")
        state["candidates"].reverse()
        request, _ = prepare(state, control)
        response = authored_response(request, level=0)
        index = next(i for i, c in enumerate(request["state"]["candidates"]) if c["id"] == "c1")
        for dimension in ["relevance", "information"]:
            response["answers"][f"c{index}_{dimension}"].update(score=3.0,
                probabilities={"0": 0.0, "1": 0.0, "2": 0.0, "3": 1.0})
        self.assertEqual(rank_response(request, response)["suggested_id"], "c1")

    def test_mismatched_control_ids_are_rejected(self):
        state, control = load_case("01_finish_journey")
        del control["c1"]
        with self.assertRaises(ValueError): prepare(state, control)


if __name__ == "__main__":
    unittest.main()
