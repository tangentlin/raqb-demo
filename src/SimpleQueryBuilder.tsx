import React, { useState, useCallback } from "react";

// >>>
import type {
  JsonGroup,
  Config,
  ImmutableTree,
  BuilderProps,
} from "@react-awesome-query-builder/ui";
import {
  Utils as QbUtils,
  Query,
  Builder,
} from "@react-awesome-query-builder/ui";
import { MuiConfig } from "@react-awesome-query-builder/mui";
import "@react-awesome-query-builder/mui/css/styles.css";
import { produce } from "immer";
import { styled } from '@mui/material/styles'
import { Typography } from "@mui/material";
// or import '@react-awesome-query-builder/ui/css/compact_styles.css';
const InitialConfig = MuiConfig;
// <<<

// You need to provide your own config. See below 'Config format'

const StyledQueryBuilder = styled('div')`
  .query-builder {
    .group {
      .group--header {
        .group--actions {
          // Always show actions
          opacity: 1;
        }
      }
      .rule {
        .rule--header {
          // Always show actions
          opacity: 1;
        }
      }
    }
  }
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
      label: "Promo?",
      type: "boolean",
      operators: ["equal"],
      valueSources: ["value"],
    },
  };
});

// You can load query value from your backend storage (for saving see `Query.onChange()`)
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
    tree: QbUtils.loadTree(queryValue),
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

  const renderBuilder = useCallback(
    (props: BuilderProps) => { 
      const builderConfig: Config = {
        ...props.config,
      }

      return (
      <div className="query-builder-container" style={{ padding: "10px" }}>
        <div className="query-builder qb-lite">
          <Builder {...props} config={builderConfig} />
        </div>
      </div>
    )},
    []
  );

  return (
    <StyledQueryBuilder>
      <Typography variant="h4">Simple Query Builder</Typography>
      <Query
        {...config}
        value={state.tree}
        onChange={onChange}
        renderBuilder={renderBuilder}
      />
      <div className="query-builder-result">
        <div>
          Query string:{" "}
          <pre>
            {JSON.stringify(QbUtils.queryString(state.tree, state.config))}
          </pre>
        </div>
        <div>
          JsonLogic:{" "}
          <pre>
            {JSON.stringify(QbUtils.jsonLogicFormat(state.tree, state.config))}
          </pre>
        </div>
      </div>
    </StyledQueryBuilder>
  );
};
