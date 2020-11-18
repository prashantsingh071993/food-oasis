import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import DirectionsIcon from "@material-ui/icons/Directions";
import CallIcon from "@material-ui/icons/Call";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import ShareIcon from "@material-ui/icons/Share";

import {
  MEAL_PROGRAM_CATEGORY_ID,
  FOOD_PANTRY_CATEGORY_ID,
} from "constants/stakeholder";
import { ORGANIZATION_COLORS, CLOSED_COLOR } from "constants/map";
import { getGoogleMapsUrl, extractNumbers } from "util/index";
import LabelButton from 'components/labelButton';

// import Icon from "components/Icon";

const useStyles = makeStyles(({ palette }) => ({
  stakeholder: {
    width: "100%",
    height: '150px',
    minHeight: "6em",
    display: "flex",
    justifyContent: "space-between",
    padding: "1em 0",
  },
  info: {
    fontSize: "1em",
    textAlign: "left",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    "& p": {
      margin: 0,
    },
  },
  label: {
    width: "100%",
    display: "flex",
  },
  closedLabel: {
    color: "#545454",
    alignSelf: "flex-end",
    backgroundColor: "#E0E0E0",
    padding: ".25em .5em",
    borderRadius: "3px",
    margin: ".25em 0",
  },
  openLabel: {
    color: "#fff",
    alignSelf: "flex-start",
    backgroundColor: "#008000",
    padding: ".25em",
    borderRadius: "3px",
    margin: ".25em 0",
    marginRight: "0.25em",
  },
  closingSoonLabel: {
    color: "#fff",
    alignSelf: "flex-start",
    backgroundColor: "#CC3333",
    padding: ".25em",
    borderRadius: "3px",
    margin: ".25em 0",
  },
  buttons: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    margin: '0 -5px',
    justifyContent: "space-between",
  },
  leftInfo: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: "1em",
  },
  name: {
    fontSize: "16px",
  },
}));

const isLastOccurrenceInMonth = (currentDay) => {
  const currentMonth = currentDay.month();
  if (currentDay.add(7, "days").month() !== currentMonth) {
    return true;
  }
};

const stakeholdersCurrentDaysHours = (stakeholder) => {
  const currentDay = moment();
  const currentDayOfWeek = currentDay.format("ddd");
  const dayOccurrenceInMonth = Math.ceil(currentDay.date() / 7); // In tandum with currentDayOfWeek tells us which week the day falls
  const currentTime = currentDay.format("HH:mm:ss");
  const currentDaysHoursOfOperation = stakeholder?.hours.filter(
    (todaysHours) => {
      const hasHoursToday = currentDayOfWeek === todaysHours.day_of_week;
      const stakeholderOpenTime = moment(todaysHours.open, "HH:mm:ss").format(
        "HH:mm:ss"
      );
      const stakeholderClosingTime = moment(
        todaysHours.close,
        "HH:mm:ss"
      ).format("HH:mm:ss");
      const isOnlyOpenOnLastWeekOfMonth =
        hasHoursToday &&
        isLastOccurrenceInMonth(currentDay) &&
        todaysHours.week_of_month === 5;
      return (
        hasHoursToday &&
        currentTime >= stakeholderOpenTime &&
        currentTime < stakeholderClosingTime &&
        (todaysHours.week_of_month === 0 ||
          dayOccurrenceInMonth === todaysHours.week_of_month ||
          isOnlyOpenOnLastWeekOfMonth)
      );
    }
  );
  if (currentDaysHoursOfOperation?.length > 0) {
    return currentDaysHoursOfOperation;
  }
};

const calculateMinutesToClosing = (hours) => {
  const currentTime = moment().format("HH:mm");
  return moment(hours[0].close, "HH:mm").diff(
    moment(currentTime, "HH:mm"),
    "minutes"
  );
};

const isAlmostClosed = (hours) => {
  const minutesToCloseFlag = 60;
  const minutesToClosing = calculateMinutesToClosing(hours);
  return minutesToClosing <= minutesToCloseFlag;
};

const StakeholderPreview = ({ stakeholder, onSelectStakeholder, selected }) => {
  const classes = useStyles();

  const mainNumber = extractNumbers(stakeholder.phone).find((n) => n.number);

  const stakeholderHours = stakeholdersCurrentDaysHours(stakeholder);
  const isOpenFlag = !!stakeholderHours;
  const isAlmostClosedFlag = isOpenFlag && isAlmostClosed(stakeholderHours);
  const minutesToClosing =
    isAlmostClosedFlag && calculateMinutesToClosing(stakeholderHours);

  return (
    <div
      className={classes.stakeholder}
      key={stakeholder.id}
      onClick={() => onSelectStakeholder(stakeholder)}
    >
      <div className={classes.leftInfo}>
        {/* <Icon stakeholder={stakeholder} height="50px" width="50px" /> */}
        {stakeholder.distance ? (
          <div>
            {stakeholder.distance >= 10
              ? stakeholder.distance.toString().substring(0, 3).padEnd(4, "0")
              : stakeholder.distance.toString().substring(0, 3)}{" "}
            mi
          </div>
        ) : null}
      </div>
      <div className={classes.info}>
        <p className={classes.name}>{stakeholder.name}</p>
        <div className={classes.label}>
          {stakeholder.categories.map((category) => (
            <em
              key={stakeholder.id + category.id}
              style={{
                alignSelf: "flex-start",
                margin: "0.25em 0",
                marginRight: "0.25em",
                color:
                  stakeholder.inactiveTemporary || stakeholder.inactive
                    ? CLOSED_COLOR
                    : category.id === FOOD_PANTRY_CATEGORY_ID
                    ? ORGANIZATION_COLORS[FOOD_PANTRY_CATEGORY_ID]
                    : category.id === MEAL_PROGRAM_CATEGORY_ID
                    ? ORGANIZATION_COLORS[MEAL_PROGRAM_CATEGORY_ID]
                    : "#000",
              }}
            >
              {category.name}
            </em>
          ))}
        </div>
        <div className={classes.label}>
          {stakeholder.inactiveTemporary || stakeholder.inactive ? (
            <em className={classes.closedLabel}>
              {stakeholder.inactiveTemporary
                ? "Temporarily Closed"
                : "Permanently Closed"}
            </em>
          ) : null}

          {isOpenFlag &&
          !(stakeholder.inactiveTemporary || stakeholder.inactive) ? (
            <em className={classes.openLabel}>OPEN NOW</em>
          ) : null}

          {isAlmostClosedFlag &&
          !(stakeholder.inactiveTemporary || stakeholder.inactive) &&
          isAlmostClosedFlag ? (
            <em className={classes.closingSoonLabel}>
              {`Closing in ${minutesToClosing} minutes`}
            </em>
          ) : null}
        </div>
        <div className={classes.buttons}>
          <LabelButton
            onClick={() =>
              window.open(
                getGoogleMapsUrl(
                  stakeholder.zip,
                  stakeholder.address1,
                  stakeholder.address2 || null
                )
              )
            }
            label="Directions"
          >
            <DirectionsIcon />
          </LabelButton>
          {mainNumber && (
            <LabelButton
              onClick={() => window.open(`tel:${mainNumber.value}`)}
              label="Call"
            >
              <CallIcon />
            </LabelButton>
          )}
          <LabelButton label="Details">
            <InfoIcon />
          </LabelButton>
          <LabelButton label="Share">
            <ShareIcon />
          </LabelButton>
        </div>
      </div>
    </div>
  );
};

export default StakeholderPreview;
