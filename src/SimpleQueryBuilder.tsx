import React, { useState, useCallback } from "react";

// >>>
import type {
  JsonGroup,
  Config,
  ImmutableTree,
  BuilderProps,
  JsonLogicResult,
} from "@react-awesome-query-builder/ui";
import {
  Utils as QbUtils,
  Query,
  Builder,
} from "@react-awesome-query-builder/ui";
import { MuiConfig } from "@react-awesome-query-builder/mui";
import "@react-awesome-query-builder/mui/css/styles.css";
import { produce } from "immer";
import { styled } from "@mui/material/styles";
import { Stack, Typography } from "@mui/material";
// or import '@react-awesome-query-builder/ui/css/compact_styles.css';
const InitialConfig = MuiConfig;
// <<<

// You need to provide your own config. See below 'Config format'

const StyledQueryBuilder = styled("div")`
// Temporarily set to 420px to avoid horizontal scrolling
min-width: 420px;
box-sizing: border-box;

.query-builder {
  padding: 0;
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  box-sizing: border-box;

  .group-or-rule-container {
    padding-right: 0;
  }

  .group {
    background: none;
    border: none;
    .group--header {
      &::before {
        // Remove tree line
        display: none;
      }
    }
    .group--conjunctions {
      // Always hide conjunctions
      display: none;
    }
    .rule {
      &::before,
      &::after {
        // Remove tree line
        display: none;
      }
    }
  }
`;

const Code = styled("pre")`
  width: 90%;
  background-color: ${(props) => props.theme.palette.grey[100]};
  padding: ${(props) => props.theme.spacing(1)};
  max-height: ${(props) => props.theme.spacing(30)};
  font-size: 80%;
  overflow: auto;
`;

const config: Config = produce(InitialConfig, (draft) => {
  // draft.settings.canRegroup = false;
  draft.settings.defaultConjunction = "AND";
  draft.settings.showNot = false;
  // Lock to simple 1-level nesting
  draft.settings.maxNesting = 1;
  draft.settings.forceShowConj = false;

  draft.fields = {
    qty: {
      label: "Qty",
      type: "number",
      fieldSettings: {
        min: 0,
      },
      valueSources: ["value"],
      preferWidgets: ["number"],
    },
    price: {
      label: "Price",
      type: "number",
      valueSources: ["value"],
      fieldSettings: {
        min: 10,
        max: 100,
      },
      preferWidgets: ["slider", "rangeslider"],
    },
    name: {
      label: "Name",
      type: "text",
    },
    color: {
      label: "Color",
      type: "select",
      valueSources: ["value"],
      fieldSettings: {
        listValues: [
          { value: "yellow", title: "Yellow" },
          { value: "green", title: "Green" },
          { value: "orange", title: "Orange" },
        ],
      },
    },
    is_promotion: {
      label: "Promo",
      type: "boolean",
      operators: ["equal"],
      valueSources: ["value"],
    },
    manufacture_date: {
      label: "Manufacture Date",
      type: "date",
      valueSources: ["value"],
    },
  };
});

// You can load query value from your backend storage (for saving see `Query.onChange()`)

const querySpel =
  "(price >= 30 && price <= 100 && color == 'green' && manufacture_date >= T(java.time.LocalDate).parse('2021-02-26', T(java.time.format.DateTimeFormatter).ofPattern('yyyy-MM-dd')) && manufacture_date <= T(java.time.LocalDate).parse('2025-02-26', T(java.time.format.DateTimeFormatter).ofPattern('yyyy-MM-dd')))";

const jsonLogic: JsonLogicResult = {
  errors: [],
  logic: {
    and: [
      {
        "<=": [
          30,
          {
            var: "price",
          },
          100,
        ],
      },
      {
        "==": [
          {
            var: "color",
          },
          "green",
        ],
      },
      {
        "<=": [
          "2025-02-01T05:00:00.000Z",
          {
            var: "manufacture_date",
          },
          "2025-02-28T05:00:00.000Z",
        ],
      },
    ],
  },
  data: {
    price: null,
    color: null,
    manufacture_date: null,
  },
};

const queryValue: JsonGroup = {
  id: QbUtils.uuid(),
  type: "group",
  children1: [
    {
      type: "rule",
      id: "ba88bb89-89ab-4cde-b012-31951b8f840f",
      properties: {
        fieldSrc: "field",
        field: "price",
        operator: "between",
        value: [30, 100],
        valueSrc: ["value", "value"],
        valueType: ["number", "number"],
        valueError: [null, null],
      },
    },
    {
      type: "rule",
      id: "989ba9aa-4567-489a-bcde-f1951b902458",
      properties: {
        fieldSrc: "field",
        field: "color",
        operator: "select_equals",
        value: ["green"],
        valueSrc: ["value"],
        valueType: ["select"],
        valueError: [null],
      },
    },
  ],
};

export const SimpleQueryBuilder: React.FC = () => {
  const [state, setState] = useState({
    tree: QbUtils.loadFromJsonLogic(jsonLogic.logic, config)!,
    config: config,
  });

  const onChange = useCallback(
    (immutableTree: ImmutableTree, config: Config) => {
      // Tip: for better performance you can apply `throttle` - see `packages/examples/src/demo`
      setState((prevState) => ({
        ...prevState,
        tree: immutableTree,
        config: config,
      }));

      const jsonTree = QbUtils.getTree(immutableTree);
      console.log(jsonTree);
      // `jsonTree` can be saved to backend, and later loaded to `queryValue`
    },
    []
  );

  const renderBuilder = useCallback((props: BuilderProps) => {
    return (
      <div className="query-builder-container" style={{ padding: "10px" }}>
        <div className="query-builder">
          <Builder {...props} />
        </div>
      </div>
    );
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Simple Query Builder</Typography>
      <Typography>
        This is a simple query builder with minimal configuration. More
        customization would be needed to fit the UI in a narrower space than the
        current 560px setting.
      </Typography>
      <StyledQueryBuilder>
        <Query
          {...config}
          value={state.tree}
          onChange={onChange}
          renderBuilder={renderBuilder}
        />
        <Typography component={"div"}>
          <div>
            Query string:{" "}
            <Code>
              {JSON.stringify(QbUtils.queryString(state.tree, state.config))}
            </Code>
          </div>
          <div>
            JsonLogic (
            {JSON.stringify(
              QbUtils.jsonLogicFormat(state.tree, state.config).logic
            ).length.toLocaleString()}{" "}
            bytes):{" "}
            <Code>
              {JSON.stringify(
                QbUtils.jsonLogicFormat(state.tree, state.config),
                null,
                2
              )}
            </Code>
          </div>

          <div>
            Raw Tree:{" "}
            <Code>{JSON.stringify(QbUtils.getTree(state.tree), null, 2)}</Code>
          </div>
        </Typography>
      </StyledQueryBuilder>
    </Stack>
  );
};
