import React, { useState, useCallback } from "react";

// >>> 
import type { JsonGroup, Config, ImmutableTree, BuilderProps } from '@react-awesome-query-builder/ui';
import { Utils as QbUtils, Query, Builder } from '@react-awesome-query-builder/ui';
import { MuiConfig, MuiWidgets } from '@react-awesome-query-builder/mui';
import '@react-awesome-query-builder/mui/css/styles.css';
// or import '@react-awesome-query-builder/ui/css/compact_styles.css';
const InitialConfig = MuiConfig;
// <<<

// You need to provide your own config. See below 'Config format'
const config: Config = {
  ...InitialConfig,
  fields: {
    qty: {
      label: "Qty",
      type: "number",
      fieldSettings: {
        min: 0
      },
      valueSources: ["value"],
      preferWidgets: ["number"]
    },
    price: {
      label: "Price",
      type: "number",
      valueSources: ["value"],
      fieldSettings: {
        min: 10,
        max: 100
      },
      preferWidgets: ["slider", "rangeslider"]
    },
    name: {
      label: 'Name',
      type: 'text',
    },
    color: {
      label: "Color",
      type: "select",
      valueSources: ["value"],
      fieldSettings: {
        listValues: [
          { value: "yellow", title: "Yellow" },
          { value: "green", title: "Green" },
          { value: "orange", title: "Orange" }
        ]
      }
    },
    is_promotion: {
      label: "Promo?",
      type: "boolean",
      operators: ["equal"],
      valueSources: ["value"]
    }
  }
};

// You can load query value from your backend storage (for saving see `Query.onChange()`)
const queryValue: JsonGroup = { id: QbUtils.uuid(), type: "group" };

export const SimpleQueryBuilder: React.FC = () => {
  const [state, setState] = useState({
    tree: QbUtils.loadTree(queryValue),
    config: config
  });

  const onChange = useCallback((immutableTree: ImmutableTree, config: Config) => {
    // Tip: for better performance you can apply `throttle` - see `packages/examples/src/demo`
    setState(prevState => ({ ...prevState, tree: immutableTree, config: config }));

    const jsonTree = QbUtils.getTree(immutableTree);
    console.log(jsonTree);
    // `jsonTree` can be saved to backend, and later loaded to `queryValue`
  }, []);

  const renderBuilder = useCallback((props: BuilderProps) => (
    <div className="query-builder-container" style={{ padding: "10px" }}>
      <div className="query-builder qb-lite">
        <Builder {...props} />
      </div>
    </div>
  ), []);

  return (
    <div>
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
          MongoDb query:{" "}
          <pre>
            {JSON.stringify(QbUtils.mongodbFormat(state.tree, state.config))}
          </pre>
        </div>
        <div>
          SQL where:{" "}
          <pre>
            {JSON.stringify(QbUtils.sqlFormat(state.tree, state.config))}
          </pre>
        </div>
        <div>
          JsonLogic:{" "}
          <pre>
            {JSON.stringify(QbUtils.jsonLogicFormat(state.tree, state.config))}
          </pre>
        </div>
      </div>
    </div>
  );
};
