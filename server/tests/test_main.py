import os
import sys
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from main import compute_rating


class TestComputeRating:
    def test_returns_value_between_1_and_5(self):
        rating = compute_rating("driving", 10, 25, 20)
        assert 1 <= rating <= 5

    def test_low_cost_high_rating(self):
        rating_expensive = compute_rating("driving", 10, 50, 20)
        rating_cheap = compute_rating("driving", 10, 5, 20)
        assert rating_cheap >= rating_expensive

    def test_zero_emission_modes_score_higher(self):
        driving_rating = compute_rating("driving", 5, 10, 10)
        scooter_rating = compute_rating("scooter", 5, 10, 20)
        assert scooter_rating >= driving_rating

    def test_zero_distance_returns_minimum(self):
        rating = compute_rating("driving", 0, 10, 5)
        assert rating == 1

    def test_zero_cost_returns_minimum(self):
        rating = compute_rating("driving", 10, 0, 5)
        assert rating == 1

    def test_shorter_time_better_rating(self):
        fast_rating = compute_rating("driving", 10, 20, 10)
        slow_rating = compute_rating("driving", 10, 20, 40)
        assert fast_rating >= slow_rating

    def test_comfort_affects_rating(self):
        uber_rating = compute_rating("uber", 10, 20, 20)
        walking_rating = compute_rating("walking", 10, 20, 60)
        assert uber_rating >= walking_rating


class TestCoordinatesFromAddress:
    @patch('main.gmaps')
    def test_successful_geocoding(self, mock_gmaps):
        from main import coordinates_from_address
        mock_gmaps.geocode.return_value = [
            {'geometry': {'location': {'lat': 35.7796, 'lng': -78.6382}}}
        ]
        result = coordinates_from_address("Raleigh, NC")
        assert result == [35.7796, -78.6382]

    @patch('main.gmaps')
    def test_failed_geocoding_returns_none(self, mock_gmaps):
        from main import coordinates_from_address
        mock_gmaps.geocode.return_value = []
        result = coordinates_from_address("NonexistentPlace12345")
        assert result is None

    def test_no_gmaps_client_returns_none(self):
        from main import coordinates_from_address
        with patch('main.gmaps', None):
            result = coordinates_from_address("Raleigh, NC")
            assert result is None


class TestGetTravelTime:
    @patch('main.gmaps')
    def test_successful_directions(self, mock_gmaps):
        from main import get_travel_time
        mock_gmaps.directions.return_value = [
            {'legs': [{'duration': {'value': 1200}}]}
        ]
        result = get_travel_time("A", "B", "driving")
        assert result == 20

    @patch('main.gmaps')
    def test_no_route_returns_zero(self, mock_gmaps):
        from main import get_travel_time
        mock_gmaps.directions.return_value = []
        result = get_travel_time("A", "B", "driving")
        assert result == 0

    def test_no_gmaps_client_returns_zero(self):
        from main import get_travel_time
        with patch('main.gmaps', None):
            result = get_travel_time("A", "B", "driving")
            assert result == 0
