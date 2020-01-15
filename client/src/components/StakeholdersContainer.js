import React, { useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import StakeholderSearch from './StakeholderSearch';
import StakeholderCriteria from './StakeholderCriteria';
import StakeholderList from './StakeholderList';
import Map from './Map';
import { RotateLoader } from 'react-spinners';
import { useStakeholders } from '../hooks/useStakeholders/useStakeholders';
import { store } from 'state/store';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
  },
  header: {
    display: 'flex',
  },
};

function StakeholdersContainer(props) {
  const { history, userCoordinates } = props;
  const { state, dispatch, actionTypes, search } = useStakeholders(
    history,
    userCoordinates,
  );
  const [isMapView, setIsMapView] = React.useState(true);
  const openSearchPanel = (isOpen) => {
    dispatch({ type: actionTypes.TOGGLE_SEARCH_PANEL, isOpen });
  };
  const globalState = useContext(store);
  console.log('globalState', globalState);

  const {
    stakeholders,
    categories,
    searchString,
    selectedLongitude,
    selectedLatitude,
    selectedLocationName,
    selectedDistance,
    selectedCategories,
    isSearchPanelOpen,
    isLoading,
    latitude,
    longitude,
  } = state;
  // console.warn('latitude', latitude);
  // console.warn('longitude', longitude);

  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <Typography
          variant={'h4'}
          component={'h4'}
          align="center"
          style={{ marginBottom: '0.5em' }}
        >
          Stakeholders{' '}
        </Typography>
      </header>
      <>
        {isSearchPanelOpen ? (
          <StakeholderSearch
            key={selectedLatitude}
            latitude={latitude}
            longitude={longitude}
            selectedLatitude={selectedLatitude}
            selectedLongitude={selectedLongitude}
            selectedLocationName={selectedLocationName}
            categories={categories}
            searchString={searchString}
            selectedCategories={selectedCategories}
            selectedDistance={selectedDistance}
            search={search}
            switchResultsView={() => setIsMapView(!isMapView)}
            isMapView={isMapView}
          />
        ) : (
          <StakeholderCriteria
            key={selectedLatitude}
            latitude={selectedLatitude}
            longitude={selectedLongitude}
            selectedLocationName={selectedLocationName}
            searchString={searchString}
            selectedCategories={selectedCategories}
            selectedDistance={selectedDistance}
            openSearchPanel={openSearchPanel}
            switchResultsView={() => setIsMapView(!isMapView)}
            isMapView={isMapView}
          />
        )}
        {isSearchPanelOpen ? null : isLoading ? (
          <div
            style={{
              height: '200',
              width: '100%',
              margin: '100px auto',
              display: 'flex',
              justifyContent: 'space-around',
            }}
            aria-label="Loading spinner"
          >
            <RotateLoader
              // css={}
              sizeUnit={'px'}
              size={15}
              color={'#FAEBD7'}
              loading={true}
            />
          </div>
        ) : isMapView && selectedLatitude && selectedLongitude ? (
          <Map
            stakeholders={stakeholders}
            selectedLatitude={selectedLatitude}
            selectedLongitude={selectedLongitude}
          />
        ) : (
          <StakeholderList stakeholders={stakeholders} />
        )}
      </>
    </main>
  );
}

export default withRouter(StakeholdersContainer);
