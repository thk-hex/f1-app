package com.f1champions.app.presentation.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
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

@OptIn(ExperimentalMaterial3Api::class)
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
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
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
                    races = state.data,
                    championId = uiState.championId
                )
            }
        }
    }
}

@Composable
fun RaceWinnersList(
    races: List<Race>,
    championId: String
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize()
    ) {
        items(races) { race ->
            RaceWinnerItem(
                race = race,
                isChampion = race.winnerId == championId
            )
        }
    }
}

@Composable
fun RaceWinnerItem(
    race: Race,
    isChampion: Boolean
) {
    val f1Red = colorResource(id = R.color.f1_red)
    val championBackground = f1Red.copy(alpha = 0.1f)
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(if (isChampion) championBackground else Color.Transparent)
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Round number indicator
            Surface(
                shape = CircleShape,
                color = if (isChampion) f1Red else MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(end = 16.dp)
            ) {
                Text(
                    text = race.round,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                )
            }
            
            // Race details
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = race.grandPrixName,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = race.winnerName,
                    style = MaterialTheme.typography.bodyLarge,
                    color = if (isChampion) f1Red else MaterialTheme.colorScheme.onSurface
                )
            }
        }
    }
} 