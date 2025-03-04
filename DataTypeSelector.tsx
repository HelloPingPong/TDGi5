import React, { useEffect, useState } from 'react';
import { getDataTypes } from '../../../api/template-api';
import { Card } from '../../common/Card';
import { Select } from '../../common/Select';
import { Alert } from '../../common/Alert';
import { Badge } from '../../common/Badge';
import useApi from '../../../hooks/useApi';
import './DataTypeSelector.css';

export interface DataTypeMetadata {
  type: string;
  displayName: string;
  category: string;
  description: string;
  constraintsMetadata: Record<string, string>;
}

interface DataTypeOptionGroup {
  label: string;
  options: {
    value: string;
    label: string;
  }[];
}

interface DataTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
  onMetadataChange?: (metadata: DataTypeMetadata | null) => void;
  showDetails?: boolean;
}

const DataTypeSelector: React.FC<DataTypeSelectorProps> = ({
  value,
  onChange,
  onMetadataChange,
  showDetails = true,
}) => {
  const [dataTypeOptions, setDataTypeOptions] = useState<DataTypeOptionGroup[]>([]);
  const [selectedTypeMetadata, setSelectedTypeMetadata] = useState<DataTypeMetadata | null>(null);
  
  const {
    data: dataTypesData,
    isLoading,
    error,
    execute: fetchDataTypes,
  } = useApi(getDataTypes, [], { immediate: true });

  useEffect(() => {
    if (dataTypesData?.data) {
      // Group data types by category
      const groupedOptions: Record<string, DataTypeOptionGroup> = {};
      
      dataTypesData.data.forEach((dataType: DataTypeMetadata) => {
        const category = dataType.category || 'Other';
        
        if (!groupedOptions[category]) {
          groupedOptions[category] = {
            label: category,
            options: [],
          };
        }
        
        groupedOptions[category].options.push({
          value: dataType.type,
          label: dataType.displayName,
        });
      });
      
      // Sort options within each group
      Object.values(groupedOptions).forEach(group => {
        group.options.sort((a, b) => a.label.localeCompare(b.label));
      });
      
      // Sort groups by category name
      const sortedGroups = Object.values(groupedOptions).sort((a, b) => 
        a.label.localeCompare(b.label)
      );
      
      setDataTypeOptions(sortedGroups);
      
      // Find and set metadata for currently selected type
      if (value) {
        const selectedType = dataTypesData.data.find(
          (dataType: DataTypeMetadata) => dataType.type === value
        );
        setSelectedTypeMetadata(selectedType || null);
        if (onMetadataChange) {
          onMetadataChange(selectedType || null);
        }
      }
    }
  }, [dataTypesData, value, onMetadataChange]);
  
  const handleTypeChange = (selectedValue: string) => {
    onChange(selectedValue);
    
    if (dataTypesData?.data) {
      const selectedType = dataTypesData.data.find(
        (dataType: DataTypeMetadata) => dataType.type === selectedValue
      );
      setSelectedTypeMetadata(selectedType || null);
      if (onMetadataChange) {
        onMetadataChange(selectedType || null);
      }
    }
  };
  
  return (
    <div className="data-type-selector">
      {error && (
        <Alert type="error" className="mb-4">
          Failed to load data types: {error}
        </Alert>
      )}
      
      <Select
        label="Data Type"
        value={value}
        onChange={handleTypeChange}
        options={dataTypeOptions}
        isLoading={isLoading}
        placeholder="Select a data type..."
        required
      />
      
      {showDetails && selectedTypeMetadata && (
        <Card className="data-type-details mt-4">
          <div className="data-type-header">
            <h4 className="data-type-name">{selectedTypeMetadata.displayName}</h4>
            <Badge color="primary">{selectedTypeMetadata.category}</Badge>
          </div>
          
          <p className="data-type-description">{selectedTypeMetadata.description}</p>
          
          {Object.keys(selectedTypeMetadata.constraintsMetadata).length > 0 && (
            <div className="data-type-constraints">
              <h5>Available Constraints:</h5>
              <ul>
                {Object.entries(selectedTypeMetadata.constraintsMetadata).map(([key, description]) => (
                  <li key={key}>
                    <strong>{key}</strong>: {description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default DataTypeSelector;
