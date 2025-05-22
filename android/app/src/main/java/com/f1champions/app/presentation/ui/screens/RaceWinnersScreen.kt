package com.f1champions.app.presentation.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.Card
import androidx.compose.material.Icon
import androidx.compose.material.IconButton
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Scaffold
import androidx.compose.material.Text
import androidx.compose.material.TopAppBar
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.f1champions.app.R
import com.f1champions.app.domain.model.Race
import com.f1champions.app.presentation.ui.UiState
import com.f1champions.app.presentation.ui.components.ErrorMessage
import com.f1champions.app.presentation.ui.components.LoadingIndicator
import com.f1champions.app.presentation.viewmodel.RaceWinnersViewModel

@Composable
fun RaceWinnersScreen(
    onBackClick: () -> Unit,
    viewModel: RaceWinnersViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        text = stringResource(
                            R.string.race_winners_screen_title, 
                            uiState.season
                        )
                    ) 
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (val state = uiState.raceWinners) {
                is UiState.Loading -> LoadingIndicator()
                is UiState.Error -> ErrorMessage(
                    message = state.message,
                    onRetryClick = { viewModel.fetchRaceWinners() }
                )
                is UiState.Success -> RaceWinnersList(
                    races = state.data
                )
            }
        }
    }
}

@Composable
fun RaceWinnersList(
    races: List<Race>
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize()
    ) {
        items(races) { race ->
            RaceWinnerItem(race = race)
        }
    }
}

@Composable
fun RaceWinnerItem(
    race: Race
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        elevation = 4.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = race.grandPrixName,
                style = MaterialTheme.typography.h6,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = race.winnerName,
                style = MaterialTheme.typography.body1
            )
        }
    }
} 