package com.f1champions.app.presentation.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.f1champions.app.R
import com.f1champions.app.domain.model.Season
import com.f1champions.app.presentation.ui.UiState
import com.f1champions.app.presentation.ui.components.ErrorMessage
import com.f1champions.app.presentation.ui.components.LoadingIndicator
import com.f1champions.app.presentation.viewmodel.ChampionsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChampionsScreen(
    onSeasonClick: (String, String) -> Unit,
    viewModel: ChampionsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = stringResource(R.string.champions_screen_title)) }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (val state = uiState.champions) {
                is UiState.Loading -> LoadingIndicator()
                is UiState.Error -> ErrorMessage(
                    message = state.message,
                    onRetryClick = { viewModel.fetchChampions() }
                )
                is UiState.Success -> ChampionsList(
                    champions = state.data,
                    onSeasonClick = onSeasonClick
                )
            }
        }
    }
}

@Composable
fun ChampionsList(
    champions: List<Season>,
    onSeasonClick: (String, String) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize()
    ) {
        items(champions) { season ->
            ChampionItem(
                season = season,
                onSeasonClick = onSeasonClick
            )
        }
    }
}

@Composable
fun ChampionItem(
    season: Season,
    onSeasonClick: (String, String) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .clickable { onSeasonClick(season.year, season.championId) }
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = season.year,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = season.championName,
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
} 